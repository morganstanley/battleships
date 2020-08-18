import Cell from "./Cell";
import {Orientation} from "./Orientation";
import {ShipType} from "./ShipType";

export default class Ship {
    private shipType: ShipType;
    private cells: Cell[];
    private isPlaced: boolean;

    constructor(private type: ShipType) {
        this.shipType = type;
        this.cells = [];
    }

    public place(topLeft: Cell, orientation: Orientation): boolean {
        this.cells = [];
        this.isPlaced = false;

        const X = true;
        const _ = false;
        let layout;

        switch (this.shipType) {
            case ShipType.AIRCRAFT_CARRIER :
                switch (orientation) {
                    case Orientation.LEFT:
                        layout = [
                            [X, X, X, X],
                            [_, X, X, _],
                        ];
                        break;
                    case Orientation.UP:
                        layout = [
                            [_, X],
                            [X, X],
                            [X, X],
                            [_, X],
                        ];
                        break;
                    case Orientation.RIGHT:
                        layout = [
                            [_, X, X, _],
                            [X, X, X, X],
                        ];
                        break;
                    case Orientation.DOWN:
                        layout = [
                            [X, _],
                            [X, X],
                            [X, X],
                            [X, _],
                        ];
                        break;
                }
                break;
            case  ShipType.BATTLESHIP :
                switch (orientation) {
                    case Orientation.LEFT:
                    case Orientation.RIGHT:
                        layout = [
                          [X, X, X, X],
                        ];
                        break;
                    case Orientation.UP:
                    case Orientation.DOWN:
                        layout = [
                          [X],
                          [X],
                          [X],
                          [X],
                        ];
                        break;
                }
                break;
            case ShipType.OIL_RIG :
                switch (orientation) {
                    case Orientation.LEFT:
                    case Orientation.RIGHT:
                        layout = [
                            [X, _, _, X],
                            [X, X, X, X],
                            [X, _, _, X],
                        ];
                        break;
                    case Orientation.UP:
                    case Orientation.DOWN:
                        layout = [
                            [X, X, X],
                            [_, X, _],
                            [_, X, _],
                            [X, X, X],
                        ];
                        break;
                }
                break;
            case ShipType.SPEEDBOAT :
                switch (orientation) {
                    case Orientation.LEFT:
                        layout = [
                            [X, _],
                            [X, X],
                        ];
                        break;
                    case Orientation.UP:
                        layout = [
                            [X, X],
                            [X, _],
                        ];
                        break;
                    case Orientation.RIGHT:
                        layout = [
                            [X, X],
                            [_, X],
                        ];
                        break;
                    case Orientation.DOWN:
                        layout = [
                            [_, X],
                            [X, X],
                        ];
                        break;
                }
                break;
            case ShipType.SUB :
                switch (orientation) {
                    case Orientation.LEFT:
                    case Orientation.RIGHT:
                        layout = [
                            [X, X],
                        ];
                        break;
                    case Orientation.UP:
                    case Orientation.DOWN:
                        layout = [
                            [X],
                            [X],
                        ];
                        break;
                }
                break;
        }

        if (layout) {
            const cells: Cell[] = [];
            layout.forEach((row, y) => {
                row.forEach((containsShip, x) => {
                    if (containsShip) {
                        cells.push(new Cell(topLeft.x + x, topLeft.y + y));
                    }
                });
            });
            this.cells = cells;
            this.isPlaced = true;
        }
        return this.isPlaced;
    }

    public isAt(cell: Cell): boolean {
        const {cells = []} = this;
        return cells.some(({x, y}) => cell.x === x && cell.y === y);
    }

    public getAllCells(): Cell[] {
        return this.cells;
    }

    public getIsPlaced(): boolean {
        return this.isPlaced;
    }

}
