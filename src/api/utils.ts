export function buildParams(params: { column: string, value: any }[]) {
  let statement: string = '';
  params.map((param) => {
    if (param.value) {
      if (statement) {
        statement = statement + ' AND ';
      } else {
        statement = 'WHERE '
      }
      statement = statement + `${param.column} = ${typeof(param.value) === 'string' ? `'${param.value}'` : param.value}`;
    }
  });

  return statement;
}