import Knex from './knex';
import jwt from 'jsonwebtoken';

const routes = [
    {
        path: '/products',
        method: 'GET',
        handler: ( request, reply ) => {
            const getOperation = Knex( 'products' ).where( {
                status: 'LIVE',
            } ).select( 'id', 'name', 'price', 'description', 'image' ).then( ( results ) => {
                if( !results || results.length === 0 ) {
                    reply( {
                        error: true,
                        errMessage: 'no public product found',
                    } );
                }
                reply( {
                    dataCount: results.length,
                    data: results,
                } );
            } ).catch( ( err ) => {
                reply( 'server-side error' );
            } );
        }
    },
    {
        path: '/auth',
        method: 'POST',
        handler: ( request, reply ) => {
            const { email, password } = request.payload;
            const getOperation = Knex( 'users' ).where( {
                email
            } ).select( 'name', 'email', 'password' ).then( ( [ user ] ) => {
                if( !user ) {
                    reply( {
                        error: true,
                        errMessage: 'the specified user was not found',
                    } );
                    return;
                }
                if( user.password === password ) {
                    const token = jwt.sign( {
                        email,
                        scope: user.name,
                    }, 'vZiYpmTzqXMp8PpYXKwqc9ShQ1UhyAfy', {
                        algorithm: 'HS256',
                        expiresIn: '6h',
                    } );
                    reply( {
                        token,
                        scope: user.name,
                    } );
                } else {
                    reply( 'incorrect password ' + user.password );
                }
            } ).catch( ( err ) => {
                reply( 'server-side error' );
            } );
        }
    },
    {
        path: '/products',
        method: 'POST',
        config: {
            auth: {
                strategy: 'token',
            }
        },
        handler: ( request, reply ) => {
            const { product } = request.payload;
            const insertOperation = Knex( 'products' ).insert( {
                created_by: request.auth.credentials.scope,
                name: product.name,
                price: product.species,
                image: product.image,
                description: product.description,
                status: 'LIVE'
            } ).then( ( res ) => {
                reply( {
                    data: name,
                    message: 'successfully created product'
                } );
            } ).catch( ( err ) => {
                reply( 'server-side error' );
            } );
        }
    },

    {
        path: '/products/{id}',
        method: 'PUT',
        config: {
            auth: {
                strategy: 'token',
            },
            pre: [
                {
                    method: ( request, reply ) => {
                        const { id } = request.params
                            , { scope }    = request.auth.credentials;
                        const getOperation = Knex( 'products' ).where( {
                            id,
                        } ).select( 'name' ).then( ( [ result ] ) => {
                            if( !result ) {
                                reply( {
                                    error: true,
                                    errMessage: `the product with id ${ id } was not found`
                                } ).takeover();
                            }
                            return reply.continue();
                        } );
                    }
                }
            ],
        },
        handler: ( request, reply ) => {
            const { id } = request.params
                , { product }     = request.payload;
            const insertOperation = Knex( 'products' ).where( {
                id,
            } ).update( {
                name: product.name,
                price: product.species,
                image: product.image,
                description: product.description,
            } ).then( ( res ) => {

                reply( {
                    message: 'successfully updated product'
                } );
            } ).catch( ( err ) => {
                reply( 'server-side error' );
            } );
        }
    },

    {
        path: '/products/delete/{id}',
        method: 'PUT',
        config: {
            auth: {
                strategy: 'token',
            },
            pre: [
                {
                    method: ( request, reply ) => {
                        const { id } = request.params
                            , { scope }    = request.auth.credentials;
                        const getOperation = Knex( 'products' ).where( {
                            id,
                        } ).select( 'name' ).then( ( [ result ] ) => {
                            if( !result ) {
                                reply( {
                                    error: true,
                                    errMessage: `the product with id ${ id } was not found`
                                } ).takeover();
                            }
                            return reply.continue();
                        } );
                    }
                }
            ],
        },
        handler: ( request, reply ) => {
            const { id } = request.params
                , { product }     = request.payload;
            const insertOperation = Knex( 'products' ).where( {
                id,
            } ).update( {
                status: 'HIST',
            } ).then( ( res ) => {

                reply( {
                    message: 'successfully delete product'
                } );
            } ).catch( ( err ) => {
                reply( 'server-side error' );
            } );
        }
    }
];

export default routes;