export default require( 'knex' )( {

    client: 'pg',
    connection: {

        host: 'localhost',

        user: 'postgres',
        password: 'admin123',

        database: 'jubelio-api-db',
        charset: 'utf8',

    }

} );