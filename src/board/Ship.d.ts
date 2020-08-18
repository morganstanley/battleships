import Cell from './Cell';
import ShipType from './ShipType';
import Orientation from './Orientation';

export default class Ship {
    shipType: ShipType;
    orientation: Orientation;
    cells: Array<Cell>;
    isPlaced: boolean;

    place(topLeft: Cell, orientation: Orientation) : boolean;
    isAt(cell: Cell) : boolean;
    getAllCells(): Array<Cell>;
}