import { Vec2 } from "./vector";

function intersectPointSphere(point: Vec2, center: Vec2, radius: number): boolean {
    return point.sub(center).magnitude() < radius
}

function intersectPointRect(point: Vec2, pos: Vec2, dim: Vec2): boolean {
    let p = point.sub(pos);
    return inRange(p.x, 0, dim.x) && inRange(p.y, 0, dim.y);
}

function intersectSphereSphere(c1: Vec2, r1: number, c2: Vec2, r2: number): boolean {
    return c1.sub(c2).magnitude() < (r1 + r2)
}

function inRange(v: number, min: number, max: number): boolean {
    return v > min && v < max
}
function inRangeIncl(v: number, min: number, max: number): boolean {
    return v >= min && v <= max
}

function clamp(v: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, v));
}


export {
    intersectPointSphere,
    intersectPointRect,

    intersectSphereSphere,

    inRange,
    inRangeIncl,

    clamp,
}

