
class MatDyn<ROW extends number, COL extends number> {
    public v: number[];
    // rows: horizontal
    // colums: vertical
    public readonly dim: [ROW, COL];

    protected _makeThis(): this {
        const res: this = (this as any).__proto__.constructor();
        res.v = new Array(this.dim[0] * this.dim[1]).fill(0);
        (res.dim as any) = [this.dim[0], this.dim[1]];
        return res
    }

    constructor(dim?: [ROW, COL], v?: number[]) {
        if(dim) {
            this.v = v ?? new Array(dim[0] * dim[1]).fill(0);
            this.dim = [dim[0], dim[1]];
        }
    }

    public map(fn: (v: number, idx: [number, number]) => number): this {
        const res = this._makeThis();
        for(let i = 0; i < this.v.length; i++) {
            res.v[i] = fn(this.v[i], [i % this.rows, Math.floor(i / this.rows)]);
        }
        return res
    }

    public mapZip(other: this, fn: (a: number, b: number, idx: [number, number]) => number): this {
        return this.map((v, [row, col]) => fn(v, other.at(row, col), [row, col]))
    }

    private static rowColDot<N extends number>(a: MatDyn<N, number>, b: MatDyn<number, N>, idx: [number, number]): number {
        let res = 0;
        // x x                  x x x //
        // . .  *  x . x   =>   x . x //
        // x x     x . x        x x x //
        //             mult           //
        for(let i = 0; i < a.rows; i++) { res += a.at(i, idx[1]) * b.at(idx[0], i) }
        return res;
    }

    public multDyn<ROW_OTHER extends number>(mat: MatDyn<ROW_OTHER, ROW>): MatDyn<ROW_OTHER, COL> {
        return new MatDyn([this.rows as ROW_OTHER, mat.columns as COL]).map((_, [row, col]) => MatDyn.rowColDot(this, mat, [row, col]));
    }

    protected multDynPreset<ROW_OTHER extends number, T extends MatDyn<ROW_OTHER, COL>>(mat: MatDyn<ROW_OTHER, ROW>, inital: T): T {
        return inital.map((_, [row, col]) => MatDyn.rowColDot(this, mat, [row, col]))
    }

    public at(row: number, col: number): number { return this.v[row + col * this.rows] }

    public add          (mat: this): this { return this.mapZip(mat, (a, b) => a + b) }
    public sub          (mat: this): this { return this.mapZip(mat, (a, b) => a - b) }
    public multEntries  (mat: this): this { return this.mapZip(mat, (a, b) => a * b) }
    public divEntries   (mat: this): this { return this.mapZip(mat, (a, b) => a / b) }

    public addS         (s: number): this { return this.map(v => v + s) }
    public subS         (s: number): this { return this.map(v => v - s) }
    public multS        (s: number): this { return this.map(v => v * s) }
    public divS         (s: number): this { return this.map(v => v / s) }

    public get rows(): number { return this.dim[0] }
    public get columns(): number { return this.dim[1] }
    public get isSquare(): boolean { return (this.dim[0] as number) === (this.dim[1] as number) }

    public clone(): this { return this.map(v => v) }
    public toArray(): number[] { return this.v.slice() }
}

class SquareMatrix<DIM extends number> extends MatDyn<DIM, DIM> {
    constructor(dim: DIM, v?: number[]) {
        super([dim, dim], v);
    }

    public mult(mat: this): this { return this.multDynPreset(mat as any, this._makeThis()) }

    public makeScale(scale: number): this {
        return this.map((v, [row, col]) => row === col ? scale : 0)
    }

    public makeIdentity(): this { return this.makeScale(1); }
}

// transforms

//  - translation
//  - scale
//  - rotate
//  
//  - reflection (about coord axis + about arbitairy axis)
//  - 

let sin = Math.sin;
let cos = Math.cos;

class Mat2 extends SquareMatrix<2> {
    constructor(v?: [
        number, number,
        number, number,
    ]) {
        super(2, v);
    }

    // todo general determinant using leibnitz forula
    determinant(): number { return this.v[0] * this.v[3] - this.v[1] * this.v[2] }

    static rot(angle: number): Mat2 {
        return new Mat2([
            cos(angle), -sin(angle),
            sin(angle),  cos(angle),
        ]);
    }
}

class Mat3 extends SquareMatrix<3> {
    constructor(v?: [
        number, number, number,
        number, number, number,
        number, number, number,
    ]) {
        super(3, v);
    }

    toMat4(): Mat4 {
        return new Mat4().map((v, [row, col]) => (row > 2 || col > 2) ? (row === col ? 1 : 0) : this.at(row, col))
    }

    static rotX(angle: number): Mat3 {
        return new Mat3([
            1, 0, 0,
            0, cos(angle), -sin(angle),
            0, sin(angle),  cos(angle),
        ])
    }
    static rotY(angle: number): Mat3 {
        return new Mat3([
             cos(angle), 0, sin(angle),
            0, 1, 0,
            -sin(angle), 0, cos(angle),
        ])
    }
    static rotZ(angle: number): Mat3{
        return new Mat3([
            cos(angle), -sin(angle), 0,
            sin(angle),  cos(angle), 0,
            0, 0, 1,
        ])
    }
    static rot(angles: [number, number, number]): Mat3 {
        return Mat3.rotZ(angles[2]).mult(Mat3.rotY(angles[1])).mult(Mat3.rotX(angles[0]))
    }
    static scale(scale: number): Mat3 { return new Mat3().makeScale(scale) }
}

class Mat4 extends SquareMatrix<4> {
    constructor(v?: [
        number, number, number, number,
        number, number, number, number,
        number, number, number, number,
        number, number, number, number,
    ]) {
        super(4, v);
    }

    static translation(vec: [number, number, number]): Mat4 {
        return new Mat4([
            1, 0, 0, vec[0],
            0, 1, 0, vec[1],
            0, 0, 1, vec[2],
            0, 0, 0, 1,
        ])
    }

    static scale(scale: number): Mat4 { return new Mat4().makeScale(scale) }
}

export {
    MatDyn,
    SquareMatrix,

    Mat2,
    Mat3,
    Mat4,
}
