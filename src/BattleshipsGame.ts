import GameServer, { Game, GameOutputChannel, Player } from "@socialgorithm/game-server";
import BattleshipsBoard from "./board/BattleshipsBoard";
import Cell from "./board/Cell";
import { Orientation} from "./board/Orientation";
import { ShipType } from "./board/ShipType";
import ShotResult from "./board/ShotResult";

interface IShipPlacement {
    orientation: Orientation;
    topleft: string;
}

interface IShipPlacementRequest {
    SHIPS: {
        [name: string]: IShipPlacement,
    };
}

export default class BattleshipsGame implements Game {

    private boards: BattleshipsBoard[];
    private nextPlayerIndex: number;
    private startTime: number;
    private gameStarted: boolean;
    private islands: Cell[];
    private playerShipPlaceAttempts: Record<Player, number>;

    constructor(private players: Player[], private outputChannel: GameOutputChannel) {
        this.startTime = Math.round(Date.now() / 1000);
        this.nextPlayerIndex = 0;
        this.gameStarted = false;
        this.players = players;
        this.playerShipPlaceAttempts = {[players[0]]: 0, [players[1]]: 0};

        this.outputChannel.sendPlayerMessage(this.players[0], "init");
        this.outputChannel.sendPlayerMessage(this.players[1], "init");

        this.islands = this.buildIslands();

        this.boards = [new BattleshipsBoard(this.islands), new BattleshipsBoard(this.islands)];
        
        this.askForShips(this.players[this.nextPlayerIndex]);

        // console.debug("Battleships Init");
    }

    // Can either be place ships request or move
    public onPlayerMessage(player: string, payload: any): void {
        try {
            const playerMessage: string[] = payload.split(" ").filter((s: string) => s);
            const action = playerMessage[0];
            let message = '';
            if (playerMessage.length > 1) {
                message = playerMessage.slice(1).join();
            }

            // Check the correct player is playing
            const expectedPlayerIndex: number = this.nextPlayerIndex;
            const playedPlayerIndex: number = this.players.indexOf(player);
            if (expectedPlayerIndex !== playedPlayerIndex) {
                const expectedPlayer = this.players[expectedPlayerIndex];
                const message = `Expected ${expectedPlayer} to play, but ${player} played. `;
                console.log(message);
                this.handleGameWon(this.players[expectedPlayerIndex], message);
                return;
            }

            switch (action) {
                case "placed-ships":
                    if (!this.gameStarted) {
                        this.placeShips(player, JSON.parse(message));
                    }
                    break;
                case "shoot":
                    if (this.gameStarted) {
                        this.onPlayerShot(player, message);
                    }
                    break;
                default:
                    // Not a valid action, lose match
                    console.log(`Player ${player} failed to give correct message`);
                    this.handleGameWon(this.players[1 - this.players.indexOf(player)], "Invalid Action");
                    break;
            }
        } catch (e) {
            // Not valid JSON, lose match, or too harsh?
            console.log(`Player ${player} failed to give valid json`);
            // console.log("Invalid JSON", payload, e);
            this.handleGameWon(this.players[1 - this.players.indexOf(player)], "Invalid JSON");
        }
    }

    public getBoards(): BattleshipsBoard[] {
        return this.boards;
    }

    private placeShips(player: Player, placeShipsObj: IShipPlacementRequest) {
        const playerBoard = this.boards[this.players.indexOf(player)];

        Object.entries(placeShipsObj.SHIPS).forEach((ship: [string, IShipPlacement]) => {
            const shipValue = ShipType[ship[0] as keyof typeof ShipType];
            const topleft = ship[1].topleft.split(",").map((coord: string) => parseInt(coord, 10));
            const topLeftCell = new Cell(topleft[0], topleft[1]);
            //console.log(`Placing Ship ${shipValue}, at top left ${topleft}, orientation ${ship[1].orientation}`);
            playerBoard.placeShip(shipValue, topLeftCell, ship[1].orientation);
        });

        // Keep asking if they are not valid
        if (!playerBoard.areShipsValid()) {
            // How many times has the player attempted to place
            const shipPlacementCount = this.playerShipPlaceAttempts[player];
            if (shipPlacementCount > 1) {
                const winningPlayer = this.players[1 - this.nextPlayerIndex];
                const message = `Player ${player} has failed to place ships 3 times. Player ${winningPlayer} wins`;
                console.log(message);
                this.handleGameWon(winningPlayer, message);
                return;
            }
            this.playerShipPlaceAttempts[player] = shipPlacementCount + 1;
            console.log(`Player ${player} failed to place. ${this.playerShipPlaceAttempts[player]} attempt`)
            this.askForShips(player);
        } else if (this.boards[1 - this.players.indexOf(player)].areShipsValid()) {
            // Get first shot if both players have placed
            this.gameStarted = true;
            this.switchNextPlayer();
            this.askForMoveFromNextPlayer();
        } else {
            // Get ships from other player
            this.switchNextPlayer();
            this.askForShips(this.players[this.nextPlayerIndex]);
        }
    }

    private onPlayerShot(player: Player, shotStr: any) {
        const shot = shotStr.split(",").map((coord: string) => parseInt(coord, 10));
        const shotCell = new Cell(shot[0], shot[1]);

        // Board of the opposite player
        const board = this.boards[1 - this.nextPlayerIndex];

        const result = board.takeShot(shotCell);
        this.sendResultToPlayer(result);
        if (result.sunk && board.allShipsSunk()) {
            this.handleGameWon(this.players[this.nextPlayerIndex], "All Ships Sunk", result);
        } else {
            this.switchNextPlayer();
            this.askForMoveFromNextPlayer(result);
            // this.outputChannel.sendGameUpdate({
            //     stats: {
            //         boards: this.boards,
            //     },
            // });
        } 
    }

    private sendResultToPlayer(previousMove?: ShotResult) {
        const currentPlayer = this.players[this.nextPlayerIndex];
        if (previousMove) {
            this.outputChannel.sendPlayerMessage(currentPlayer, `result ${this.getShotResultString(previousMove)}`);
        }
    }

    private getShotResultString(result: ShotResult) {
        if (!result) {
            return "";
        }
        return `${result.cell.x},${result.cell.y},${result.sunk ? "SUNK" : result.hit ? "HIT" : "MISS"}`;
    }

    private askForMoveFromNextPlayer(previousMove?: ShotResult) {
        const nextPlayer = this.players[this.nextPlayerIndex];
        if (previousMove) {
            this.outputChannel.sendPlayerMessage(nextPlayer, `opponent ${this.getShotResultString(previousMove)}`);
        } else {
            this.outputChannel.sendPlayerMessage(nextPlayer, "move");
        }
    }

    private askForShips(player: Player) {
        this.outputChannel.sendPlayerMessage(player, `place-ships ${JSON.stringify({islands: this.islands})}`);
    }

    private switchNextPlayer() {
        this.nextPlayerIndex = 1 - this.nextPlayerIndex;
    }

    private handleGameWon(winner: string, message?: string, shotResult?: ShotResult) {
        console.log("Game Over: Team " + winner + " Won. Message:" + message);
        this.sendGameEnd(winner, message, shotResult);
    }

    private sendGameEnd(winner?: string, message?: string, shotResult?: ShotResult) {
        // Can't have a draw in battleships
        const tie: boolean = false;
        this.outputChannel.sendGameEnd({
            duration: this.getTimeFromStart(),
            message,
            stats: {
                boards: this.boards,
            },
            tie,
            winner,
        });

        this.outputChannel.sendPlayerMessage(winner, "you-win");
        this.outputChannel.sendPlayerMessage(this.players[1 - this.players.indexOf(winner)], `you-lose ${this.getShotResultString(shotResult)}`);
    }

    private getTimeFromStart() {
        const timeNow = Math.round(Date.now() / 1000);
        return timeNow - this.startTime;
    }

    private buildIslands() {
        const islands: Cell[] = [];
        for (let i = 0; i < 3; i++) {
            const topleftx = Math.floor(Math.random() * 11);
            const toplefty = Math.floor(Math.random() * 11);
            this.addIslandCell(islands, topleftx, toplefty);
            this.addIslandCell(islands, topleftx + 1, toplefty);
            this.addIslandCell(islands, topleftx, toplefty + 1);
            this.addIslandCell(islands, topleftx + 1, toplefty + 1);
        }
        return islands;
    }

    private addIslandCell(islands: Cell[], newx: number, newy: number) {
        if (!islands.some(({x, y}) => x === newx && y === newy)) {
            islands.push(new Cell(newx, newy));
        }
    }
}
