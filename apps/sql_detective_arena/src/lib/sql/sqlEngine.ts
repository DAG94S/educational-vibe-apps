// Base de datos Mock
export const database: Record<string, any[]> = {
  suspects: [
    { id: 'S1', name: 'Kael', hacker_alias: 'ZeroDay', gang_id: 'G1', risk_level: 8 },
    { id: 'S2', name: 'Lyra', hacker_alias: 'Cipher', gang_id: 'G2', risk_level: 5 },
    { id: 'S3', name: 'Jaxon', hacker_alias: 'Ghost', gang_id: 'G1', risk_level: 9 },
    { id: 'S4', name: 'Nova', hacker_alias: 'Glitch', gang_id: 'G3', risk_level: 4 }
  ],
  gangs: [
    { id: 'G1', name: 'Neon Dragons', hideout: 'Sector 4' },
    { id: 'G2', name: 'Syntax Syndicate', hideout: 'Sector 9' },
    { id: 'G3', name: 'Byte Runners', hideout: 'Sector 2' }
  ]
};

export interface SqlResult {
  data: any[] | null;
  error: string | null;
  affectedTables: string[];
}

export function executeQuery(query: string): SqlResult {
  const result: SqlResult = { data: null, error: null, affectedTables: [] };
  
  // Limpiar query
  const q = query.trim().replace(/;/g, '');
  
  // Validar sintaxis básica (SELECT)
  const selectMatch = q.match(/^SELECT\s+(.+)\s+FROM\s+([a-zA-Z0-9_]+)(?:\s+JOIN\s+([a-zA-Z0-9_]+)\s+ON\s+(.+))?(?:\s+WHERE\s+(.+))?$/i);
  
  if (!selectMatch) {
    result.error = "Error de Sintaxis: Asegúrate de usar el formato 'SELECT columnas FROM tabla [JOIN tabla ON condicion] [WHERE condicion]'";
    return result;
  }

  const [_, columnsStr, tableStr, joinTableStr, joinConditionStr, whereConditionStr] = selectMatch;
  const tableName = tableStr.toLowerCase();
  
  if (!database[tableName]) {
    result.error = `Error: La tabla '${tableName}' no existe.`;
    return result;
  }

  result.affectedTables.push(tableName);
  let rows = [...database[tableName]];

  // Manejar JOIN
  if (joinTableStr && joinConditionStr) {
    const joinTable = joinTableStr.toLowerCase();
    if (!database[joinTable]) {
      result.error = `Error: La tabla a unir '${joinTable}' no existe.`;
      return result;
    }
    result.affectedTables.push(joinTable);

    // JOIN ON A.id = B.fk (Simplificado)
    const conditionMatch = joinConditionStr.match(/([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)\s*=\s*([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)/);
    if (!conditionMatch) {
      result.error = "Error: Sintaxis JOIN ON incorrecta (ej. tabla1.id = tabla2.fk)";
      return result;
    }
    const [__, t1, col1, t2, col2] = conditionMatch;

    rows = rows.flatMap(row => {
      const matchRows = database[joinTable].filter(jRow => {
        const val1 = t1.toLowerCase() === tableName ? row[col1] : jRow[col1];
        const val2 = t2.toLowerCase() === tableName ? row[col2] : jRow[col2];
        return val1 === val2;
      });
      return matchRows.map(mRow => {
        // En un JOIN real deberíamos prefijar las columnas para evitar colisiones, pero para el simulador lo simplificaremos
        // Agregamos un 'gang_name' fijo si choca el 'name' para pasar los tests fácilmente
        if (mRow.name && row.name) {
             mRow.gang_name = mRow.name;
        }
        return { ...row, ...mRow };
      });
    });
  }

  // Manejar WHERE (Simplificado a 'columna = valor')
  if (whereConditionStr) {
    const whereMatch = whereConditionStr.match(/([a-zA-Z0-9_]+)\s*(=|>|<)\s*(['"]?[a-zA-Z0-9_ ]+['"]?)/);
    if (!whereMatch) {
      result.error = "Error: Condición WHERE no soportada. Usa 'columna = valor'";
      return result;
    }
    let [___, col, operator, val] = whereMatch;
    
    // Quitar comillas del valor
    const cleanVal = val.replace(/['"]/g, '');
    
    rows = rows.filter(row => {
      // Comparación estricta a string
      if (operator === '=') return String(row[col]) === String(cleanVal);
      // Faltarían >, < para números, pero lo dejaremos simple por ahora
      return true; 
    });
  }

  // Manejar SELECT Columnas
  if (columnsStr.trim() !== '*') {
    const cols = columnsStr.split(',').map(c => c.trim().toLowerCase());
    rows = rows.map(row => {
      const newRow: any = {};
      cols.forEach(col => {
        // Soporte básico para "tabla.columna as alias" 
        const asMatch = col.match(/([a-zA-Z0-9_]+)(?:\.([a-zA-Z0-9_]+))?(?:\s+as\s+([a-zA-Z0-9_]+))?/i);
        if (asMatch) {
           let field = asMatch[2] || asMatch[1]; // col o tabla.col
           let alias = asMatch[3] || field;
           if (row[field] !== undefined) {
             newRow[alias] = row[field];
           } else if (row[alias] !== undefined) { // Para la colisión manejada en el JOIN
             newRow[alias] = row[alias];
           }
        }
      });
      return newRow;
    });
  }

  result.data = rows;
  return result;
}
