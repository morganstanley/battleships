import Cell from "./Cell";

export default class ShotResult {

    cell: Cell;
    hit: boolean;
    sunk: boolean;

    constructor(cell: Cell, hit: boolean, sunk: boolean);

}