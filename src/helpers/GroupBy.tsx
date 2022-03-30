export const GroupBy = (xs: any[], f: (arg0: any) => any) => {
  return xs.reduce((r, v, _i, _a, k = f(v)) => {
    (r[k] || (r[k] = [])).push(v);
    return r;
  }, {});
};
