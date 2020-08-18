import GameServer, { GameOutputChannel } from "@socialgorithm/game-server";
import { GameStartMessage } from "@socialgorithm/game-server/dist/GameMessage";
import { ServerOptions } from "./cli/options";
// tslint:disable-next-line:no-var-requires
const debug = require("debug")("sg:battleships-server");
import BattleshipsGame from "./BattleshipsGame";

export default class Server {
    private gameServer: GameServer;

    constructor(options: ServerOptions) {
        const port = process.env.PORT ? parseInt(process.env.PORT, 10) : options.port || 5433;
        this.gameServer = new GameServer({ name: "Battleships" }, this.newGameFunction, { port });
    }

    private newGameFunction(gameStartMessage: GameStartMessage, outputChannel: GameOutputChannel) {
        debug("Started new Battleships Game");
        return new BattleshipsGame(gameStartMessage.players, outputChannel);
    }
}
