import Cell from "../board/Cell";
import Ship from "../board/Ship";
import ShotResult from "../board/ShotResult";
import { Orientation } from "./Orientation";
import { ShipType } from "./ShipType";

export default class BattleshipsBoard {
    public size: number;
    private islands: Cell[];
    private ships: Record<ShipType, Ship>;
    private shots: Cell[];

    constructor(islands: Cell[]) {
        this.size = 12;
        this.shots = [];
        this.ships = {  [ShipType.AIRCRAFT_CARRIER]: new Ship(ShipType.AIRCRAFT_CARRIER),
                        [ShipType.BATTLESHIP]: new Ship(ShipType.BATTLESHIP),
                        [ShipType.OIL_RIG]: new Ship(ShipType.OIL_RIG),
                        [ShipType.SPEEDBOAT]: new Ship(ShipType.SPEEDBOAT),
                        [ShipType.SUB]: new Ship(ShipType.SUB)};
        this.islands = islands;
        return;
    }

    public takeShot(cell: Cell): ShotResult {
        this.shots.push(cell);
        let hit = false;
        let sunk = false;
        Object.values(this.ships).forEach(ship => {
            const cells = ship.getAllCells();
            if (cells.find(({x, y}) => x === cell.x && y === cell.y)) {
                hit = true;
                if (cells.every(({x, y}) =>
                    this.shots.find(shot => shot.x === x && shot.y === y) !== undefined)) {
                    sunk = true;
                }
            }
        });

        return new ShotResult(cell, hit, sunk);
    }

    public allShipsSunk(): boolean {
        return Object.values(this.ships).every(ship => {
            const cells = ship.getAllCells();
            return cells.every(({x, y}) => this.shots.find(shot => shot.x === x && shot.y === y) !== undefined);
        });
    }

    public placeShip(type: ShipType, topleft: Cell, orientation: Orientation) {
        this.ships[type].place(topleft, orientation);
    }

    /**
     * Each ship needs to
     * 1) Be Placed
     * 2) Be within the bounds of the grid
     * 3) Not be on any islands
     * 4) Not overlap with other ships
     */
    public areShipsValid(): boolean {
        const allCellsRaw = Object.values(this.ships).reduce((arr, ship) => [...arr, ...ship.getAllCells()], []).concat(this.islands);
        // Map to string so we can do unique test in set
        const allCells = allCellsRaw.map(({x, y}) => `${x}_${y}`);
        const allCellsUnique = [...Array.from(new Set(allCells))];

        return allCells.length === allCellsUnique.length &&
            Object.values(this.ships).every(ship => {
                return ship.getIsPlaced() && ship.getAllCells().every(({x, y}) => (0 <= x && x < this.size) && (0 <= y && y < this.size));
            });
    }
}
