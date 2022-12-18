import { MatDyn } from "./matrix";


class VecN<DIM extends number> {
    public v: number[];

    constructor(...v: number[]) {
        this.v = v;
    }

    private _makeThis(): this {
        return new (this as any).__proto__.constructor(new Array(this.v.length).fill(0));
    }

    public map(fn: (v: number, idx: number) => number): this {
        const res = this._makeThis();
        for(var i = 0; i < this.v.length; i++) { res.v[i] = fn(this.v[i], i) }
        return res
    }

    public zipMap(other: this, fn: (a: number, b: number, idx: number) => number): this {
        return this.map((v, idx) => fn(v, other.v[idx], idx))
    }

    public reduce<T>(fn: (acc: T, v: number, idx: number) => T, inital: T): T {
        let res = inital;
        for(var i = 0; i < this.v.length; i++) { res = fn(res, this.v[i], i) }
        return res
    }

    public zipReduce<T>(other: this, fn: (acc: T, a: number, b: number, idx: number) => T, inital: T): T {
        return this.reduce((acc, v, idx) => fn(acc, v, other.v[idx], idx), inital)
    }

    public copy(): this { return this.map(v => v) }

    public add (vec: this): this { return this.zipMap(vec, (a, b) => a + b) }
    public sub (vec: this): this { return this.zipMap(vec, (a, b) => a - b) }
    public mult(vec: this): this { return this.zipMap(vec, (a, b) => a * b) }
    public div (vec: this): this { return this.zipMap(vec, (a, b) => a / b) }

    public addS (s: number): this { return this.map(a => a + s) }
    public subS (s: number): this { return this.map(a => a - s) }
    public multS(s: number): this { return this.map(a => a * s) }
    public divS (s: number): this { return this.map(a => a / s) }

    public dot(vec: this): number { return this.zipReduce(vec, (acc, a, b) => acc + a * b, 0); }

    public sqrMagnitude(): number { return this.dot(this); }
    public magnitude(): number { return Math.sqrt(this.dot(this)); }
    public distance(other: this): number { return this.sub(other).magnitude() }
 
    public normalized(): this { return this.divS(this.magnitude()) }
    public inverted(): this { return this.multS(-1) }
    public withLength(len: number): this { return this.normalized().multS(len) }

    public lerp(target: this, v: number): this { return this.multS(1 - v).add(target.multS(v)) }

    public toArray(): number[] { return this.v.slice() }

    public multM(mat: MatDyn<number, DIM>) {
        return this.map((v, idx) => {
            let sum = 0;
            for(let i = 0; i < mat.rows; i++) { sum += v * mat.at(i, idx) }
            return sum
        })
    }
}

class Vec2 extends VecN<2> {
    constructor(
        x: number, 
        y: number,
    ) { super(x, y) }

    get x() { return this.v[0] }
    get y() { return this.v[1] }

    set x(v: number) { this.v[0] = v }
    set y(v: number) { this.v[1] = v }
}

class Vec3 extends VecN<3> {
    constructor(
        x: number,
        y: number,
        z: number,
    ) { super(x, y, z) }

    get x() { return this.v[0] }
    get y() { return this.v[1] }
    get z() { return this.v[2] }

    set x(v: number) { this.v[0] = v }
    set y(v: number) { this.v[1] = v }
    set z(v: number) { this.v[2] = v }
}

class Vec4 extends VecN<4> {
    constructor(
        x: number,
        y: number,
        z: number,
        w: number,
    ) { super(x, y, z, w) }

    get x() { return this.v[0] }
    get y() { return this.v[1] }
    get z() { return this.v[2] }
    get w() { return this.v[3] }

    set x(v: number) { this.v[0] = v }
    set y(v: number) { this.v[1] = v }
    set z(v: number) { this.v[2] = v }
    set w(v: number) { this.v[3] = v }
}

export {
    VecN,

    Vec2,
    Vec3,
    Vec4,
}
