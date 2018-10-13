exports.up = function(knex, Promise) {
    return knex.schema.table('products', function(t) {
        t.integer('purchase_price').notNull().defaultTo(0);
    });
};

exports.down = function(knex, Promise) {
    // We use `...ifExists` because we're not sure if the table's there. Honestly, this is just a safety measure. 
};
