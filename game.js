'use strict';
class Vector {
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}
	plus(vector) {
		if (vector instanceof Vector) {
      return new Vector(this.x + vector.x, this.y + vector.y);
		}
    throw new Error(`Можно прибавлять к вектору только вектор типа Vector`);
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
   return 
  }
}

class Level {
  constructor(grid = [], actors = []) {
    this.grid = grid;
    this.actors = actors;
    this.player = this.actors.find(actor => actor.type === 'player');
    this.height = this.grid.length;
    this.width = this.grid.reduce((a, b) => {
			return b.length > a ? b.length : a;
		}, 0);
    this.status = null;
    this.finishDelay = 1;
  }
  isFinished() {
    if (status !== null && finishDelay < 0) ? true : false;
  }
  actorAt(actor) {
    if (!(actor instanceof Actor) || !actor) {
      throw new Error(`Можно прибавлять к вектору только вектор типа Actor`);
    }
    if (!this.actors) {
      return undefined
    } else {
      return this.actors.find(currentActor => currentActor.isIntersect(actor));
    }
  }
  obstacleAt(pos, size) {
    if (!(pos instanceof Vector) || !(size instanceof Vector)) {
      throw new Error(`Можно прибавлять к вектору только вектор типа Vector`);
  } 

}
