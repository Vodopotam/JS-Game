'use strict';
class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  plus(vector) {
    if (!(vector instanceof Vector)) {
      throw new Error(`Можно прибавлять к вектору только вектор типа Vector`);
    }
    return new Vector(this.x + vector.x, this.y + vector.y);
  }
  times(n) {
    return new Vector(n * this.x, n * this.y)
  }
}

class Actor {
  constructor(pos = new Vector(0,0), size = new Vector(1,1), speed = new Vector(0,0)) {
    if (!(pos instanceof Vector) || !(size instanceof Vector) || !(speed instanceof Vector)) {
      throw new Error(`Можно прибавлять к вектору только вектор типа Vector`);
    }
    this.pos = pos;
    this.size = size;
    this.speed = speed;
  }
  act() {}
  get left() {
    return this.pos.x;
  }
  get top() {
    return this.pos.y;
  }
  get right() {
    return this.pos.x + this.size.x;
  }
  get bottom() {
    return this.pos.y + this.size.y;
  }
  get type() {
    return 'actor';
  }
  isIntersect(actor) {
    if (!(actor instanceof Actor) || !actor) {
      throw new Error(`Можно прибавлять к вектору только вектор типа Actor`);
    }
    if (actor === this) {
      return false;
    }
    return this.left < actor.right && this.bottom > actor.top && this.right > actor.left && this.top < actor.bottom;
  }
}

class Level {
  constructor(grid = [], actors = []) {
    this.grid = grid;
    this.actors = actors;
    this.player = this.actors.find(actor => actor.type === 'player');
    this.height = this.grid.length;
    this.width = this.grid.reduce((a, b) => b.length > a ? b.length : a, 0);
    this.status = null;
    this.finishDelay = 1;
  }
  isFinished() {
    return this.status !== null && this.finishDelay < 0;
  }
  actorAt(actor) {
    if (!(actor instanceof Actor) || !actor) {
      throw new Error(`Можно прибавлять к вектору только вектор типа Actor`);
    }
    return this.actors.find(currentActor => currentActor.isIntersect(actor));
  }
  obstacleAt(pos, size) {
    if (!(pos instanceof Vector) || !(size instanceof Vector)) {
      throw new Error(`Можно прибавлять к вектору только вектор типа Vector`);
    }
    const rightBorder = Math.ceil(pos.x + size.x);
    const bottomBorder = Math.ceil(pos.y + size.y);
    const leftBorder = Math.floor(pos.x);
    const topBorder = Math.floor(pos.y);
    if (rightBorder > this.width || leftBorder < 0 || topBorder < 0) {
      return 'wall';
    }
    if (bottomBorder > this.height) {
      return 'lava';
    }
    for (let i = topBorder; i < bottomBorder; i++) {
      for (let j = leftBorder; j < rightBorder; j++) {
        const obstacle = this.grid[i][j];
        if (obstacle) {
          return obstacle;
        }
      }
    }
  } 
  removeActor(actor) {
    this.actors = this.actors.filter(element => element !== actor);
  }
  noMoreActors(type) {
    return !this.actors.some((actor) => actor.type === type);
  }
  playerTouched(type, actor) {
    if (this.status !== null) {
      return;
    }
    if (type === 'lava' || type === 'fireball') {
      this.status = 'lost';
      return this.status;
    }
    if (type === 'coin') {
      this.removeActor(actor);
      if (this.noMoreActors('coin')) {
        this.status = 'won';
      }
    }
  }
}

class LevelParser {
  constructor(actorsDictionary = {}) {
    this.actorsDictionary = actorsDictionary;
  }
  actorFromSymbol(symbol) {
    return this.actorsDictionary[symbol];
  }
  obstacleFromSymbol(symbol) {
    if (symbol === 'x') {
      return 'wall';
    }
    if (symbol === '!') {
      return 'lava'; 
    }
  }
  createGrid(stringArr = []) {
    return stringArr.map(item => item.split('')).map(i => i.map(i => this.obstacleFromSymbol(i)));
  }
  createActors(stringArr = []) {
    return stringArr.reduce((string, row, y) => {
      row.split('').forEach((cell, x) => {
        const constructor = this.actorFromSymbol(cell);
        if (typeof constructor === 'function') {
          const actor = new constructor(new Vector(x, y));
          if (actor instanceof Actor) {
            string.push(actor);
          }
        }
      });
      return string;
    }, []);
  }
  parse(stringArr = []) {
    return new Level(this.createGrid(stringArr), this.createActors(stringArr));
  }
}

class Fireball extends Actor {
  constructor(pos = new Vector(0,0), speed = new Vector(0,0)) {
    super(pos, new Vector(1, 1), speed);
  }
  get type() {
    return 'fireball';
  }
  getNextPosition(time = 1) {
    return this.pos.plus(this.speed.times(time));
  }
  handleObstacle() {
    this.speed = this.speed.times(-1);
  }
  act(time, level) {
    if (level.obstacleAt(this.getNextPosition(time), this.size)) {
      this.handleObstacle();
    } else {
      this.pos = this.getNextPosition(time);
    }
  }
}

class HorizontalFireball extends Fireball {
  constructor(pos = new Vector(0, 0)) {
    super(pos, new Vector(2, 0), new Vector(1, 1));
  }
}

class VerticalFireball extends Fireball {
  constructor(pos = new Vector(0, 0)) {
    super(pos, new Vector(0, 2), new Vector(1, 1));
  }
}

class FireRain extends Fireball {
  constructor(pos = new Vector(0, 0)) {
    super(pos, new Vector(0, 3), new Vector(1, 1));
    this.currentPos = pos;
  }
  handleObstacle() {
    this.pos = this.currentPos;
  }
}

class Coin extends Actor {
  constructor(pos = new Vector(0, 0)) {
    super(pos.plus(new Vector(0.2, 0.1)), new Vector(0.6, 0.6));
    this.springSpeed = 8;
    this.springDist = 0.07;
    this.spring = Math.random() * (2 * Math.PI);
    this.startPos = new Vector(this.pos.x, this.pos.y);
  }
  get type() {
    return 'coin';
  }	
  updateSpring(time = 1) {
    this.spring += this.springSpeed * time;
  }
  getSpringVector() {
    return new Vector(0, Math.sin(this.spring) * this.springDist);
  }
  getNextPosition(time = 1) {
    this.updateSpring(time);
    return this.startPos.plus(this.getSpringVector());
  }
  act(time) {
    this.pos = this.getNextPosition(time);
  }
}

class Player extends Actor {
  constructor(pos = new Vector(0, 0)) {
    super(pos.plus(new Vector(0, -0.5)), new Vector(0.8, 1.5), new Vector(0, 0));
  }
  get type() {
    return 'player';
  }
}

const actorDict = {
  '@' : Player,
  'o' : Coin,
  '=' : HorizontalFireball,
  '|' : VerticalFireball,
  'v' : Fireball
}

const parser = new LevelParser(actorDict);

loadLevels()
  .then(schemas => {
    runGame(JSON.parse(schemas), parser, DOMDisplay)
      .then(() => alert('Вы выиграли!'))
  })

