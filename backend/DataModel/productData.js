import db from './db.js';

export const getDashboard = async (columns) => {
  const { filterCategory, search, size = 10, offset = 0 } = columns;

  let sql = `
    SELECT p.*, c.category
    FROM products p
    INNER JOIN category c ON p.category_id = c.category_id
  `;

  if (filterCategory && search) {
    columns.search = `%${search}%`;
    sql += `
      WHERE ${filterCategory}::text ILIKE \${search}
      ORDER BY p.id DESC
      LIMIT \${size} OFFSET \${offset}
    `;
  } else {
    sql += `
      ORDER BY p.id DESC
      LIMIT \${size} OFFSET \${offset}
    `;
  }

  return db.manyOrNone(sql, columns);
};


export const getDashboardCount = async (columns) => {
  const { filterCategory, search } = columns;

  let sql = `
    SELECT COUNT(*) AS total
    FROM products p
    INNER JOIN category c ON p.category_id = c.category_id
  `;

  if (filterCategory && search) {
    columns.search = `%${search}%`;
    sql += ` WHERE ${filterCategory}::text ILIKE \${search}`;
  }

  const result = await db.one(sql, columns);
  return Number(result.total);
};


export const getProduct = async(id) => {
    let sql = `SELECT p.*, c.category FROM products p JOIN category c 
    on p.category_id = c.category_id WHERE id=${id} ORDER BY p.id DESC`;
    const result = await db.any(sql, id);
    return result;
}


export const getCategory = async() => {
    let sql = `SELECT * FROM category ORDER BY category_id ASC`;
    const result = await db.manyOrNone(sql);
    return result;
}

export const addProduct = async(columns) => {
    const { product_name, category_id, mrp, sp, cp, classification, size } = columns;
    let sql = `INSERT INTO products (product_name, category_id, mrp, sp, cp, classification, size)
    VALUES (\${product_name}, \${category_id}, \${mrp}, \${sp}, \${cp}, \${classification}, \${size})
    RETURNING *`;
    const result = await db.any(sql, columns);
    return result;
}

export const editProduct = async(id, columns) => {
    const { product_name, category_id, mrp, sp, cp, classification, size} = columns;
    let sql = `UPDATE products SET 
    product_name=\${product_name}, category_id=\${category_id}, mrp=\${mrp}, 
    sp=\${sp},  cp=\${cp}, classification=\${classification}, size=\${size}
    WHERE id=\${id} RETURNING *`;
    const result = await db.any(sql, {id, product_name, category_id, mrp, sp, cp, classification, size});
    return result;
}

export const deleteProduct = async (id) => {
  const sql = `DELETE FROM products WHERE id = $1 RETURNING *`;
  const result = await db.any(sql, [id]);
  return result;
};
