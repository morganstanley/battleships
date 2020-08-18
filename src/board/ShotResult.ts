import Cell from "../board/Cell";

export default class ShotResult {

    public cell: Cell;
    public hit: boolean;
    public sunk: boolean;

    constructor(cell: Cell, hit: boolean, sunk: boolean) {
        this.cell = cell;
        this.hit = hit;
        this.sunk = sunk;
        return;
    }

}
