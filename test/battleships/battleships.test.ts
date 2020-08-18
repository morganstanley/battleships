import { expect, assert } from 'chai';
import BattleshipsGame from '../../src/BattleshipsGame';
import * as TypeMoq from "typemoq";
import { GameOutputChannel } from "@socialgorithm/game-server";


describe('BattleshipsServer', () => {
    const channel:TypeMoq.IMock<GameOutputChannel> = TypeMoq.Mock.ofType(GameOutputChannel);

    const players = ["TestPlayer1", "TestPlayer2"];

    const game = new BattleshipsGame(players, channel.target);

    it('game setup', function () {
        assert.lengthOf(game.getBoards(), 2);
    });

});