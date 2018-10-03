
exports.up = function(knex, Promise) {
    return knex
        .schema
        .createTable( 'users', function( usersTable ) {
            // Primary Key
            usersTable.increments();
            // Data
            usersTable.string( 'name', 250 ).notNullable();
            usersTable.string( 'email', 250 ).notNullable().unique();
            usersTable.text( 'password' ).notNullable();
            usersTable.timestamp('created_at').defaultTo(knex.fn.now());
        } )
        .createTable( 'products', function( productTable ) {
            // Primary Key
            productTable.increments();
            // Data 
            productTable.string( 'name', 250 ).notNullable();
            productTable.decimal('price').notNullable();
            productTable.text( 'image' ).notNullable();
            productTable.text( 'description' ).notNullable();
            productTable.string( 'status', 50 ).notNullable();
            productTable.string( 'created_by', 250 ).notNullable();
            productTable.timestamp( 'created_at' ).defaultTo(knex.fn.now());

        } );
};

exports.down = function(knex, Promise) {
    // We use `...ifExists` because we're not sure if the table's there. Honestly, this is just a safety measure. 
    return knex
        .schema
            .dropTableIfExists( 'products' )
            .dropTableIfExists( 'users' );
};
