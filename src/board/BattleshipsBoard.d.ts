import Ship from './Ship';
import Cell from './Cell';

export default class BattleshipsBoard {
    size: number;
    islands: Array<Cell>;
    ships: Array<Ship>;
    shots: Array<Cell>;

    constructor(size?: number, islands?: number, islandSize?: number);

}
