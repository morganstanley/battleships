export default class Cell {

    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        if (x === undefined || y === undefined || x === null || y === null) {
            throw 'Invalid coords for cell'; 
        }
        this.x = x;
        this.y = y;
    }

}
