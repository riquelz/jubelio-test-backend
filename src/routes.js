import Knex from './knex';
import jwt from 'jsonwebtoken';

const routes = [
    {
        path: '/products',
        method: 'GET',
        config: {
            cors: {
                origin: ['*'],
                additionalHeaders: ['access-control-allow-origin']
            }
        },
        handler: ( request, reply ) => {
            const getOperation = Knex( 'products' ).where( {
                status: 'LIVE',
            } ).select( 'id', 'name', 'price', 'description', 'image', 'purchase_price' ).then( ( results ) => {
                if( !results || results.length === 0 ) {
                    reply( {
                        error: true,
                        errMessage: 'no public product found',
                    } );
                }
                reply( {
                    dataCount: results.length,
                    products: results,
                } ).header('Access-Control-Allow-Origin', '*');
            } ).catch( ( err ) => {
                reply( 'server-side error' ).header('Access-Control-Allow-Origin', '*');
            } );
        }
    },
    {
        path: '/products/get/{id}',
        method: 'GET',
        config: {
            cors: {
                origin: ['*'],
                additionalHeaders: ['access-control-allow-origin', 'x-requested-with']
            }
        },
        handler: ( request, reply ) => {
            const { id } = request.params

            const getOperation = Knex( 'products' ).where( {
                status: 'LIVE', id,
            } ).select( 'id', 'name', 'price', 'description', 'image', 'purchase_price' ).then( ( results ) => {
                if( !results || results.length === 0 ) {
                    reply( {
                        error: true,
                        errMessage: 'no public product found',
                    } );
                }
                reply( {
                    dataCount: results.length,
                    product: results,
                } ).header('Access-Control-Allow-Origin', '*');
            } ).catch( ( err ) => {
                reply( 'server-side error' ).header('Access-Control-Allow-Origin', '*');
            } );
        }
    },
    {
        path: '/auth',
        method: 'POST',
        config: {
            cors: {
                origin: ['*'],
                additionalHeaders: ['access-control-allow-origin', 'x-requested-with']
            }
        },
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
                        scope: user.email,
                    }, 'vZiYpmTzqXMp8PpYXKwqc9ShQ1UhyAfy', {
                        algorithm: 'HS256',
                        expiresIn: '6h',
                    } );
                    reply( {
                        token,
                        scope: user.email,
                    } );
                } else {
                    reply( 'incorrect password ' + user.password ).header('Access-Control-Allow-Origin', '*');
                }
            } ).catch( ( err ) => {
                reply( 'server-side error' ).header('Access-Control-Allow-Origin', '*');
            } );
        }
    },
    {
        path: '/products',
        method: 'POST',
        config: {
            cors: {
                origin: ['*'],
                additionalHeaders: ['access-control-allow-origin' ,'x-requested-with', 'Authorization']
            },
            auth: {
                strategy: 'token',
            }
        },
        handler: ( request, reply ) => {
            const { name, price, description, image, purchase_price } = request.payload;
            const product = {name:name,price:price,description:description,image:image,purchase_price:purchase_price};

            const insertOperation = Knex( 'products' ).insert( {
                created_by: request.auth.credentials.scope,
                name: product.name,
                price: product.price,
                purchase_price: product.purchase_price,
                image: product.image,
                description: product.description,
                status: 'LIVE'
            } ).then( ( res ) => {
                reply( {
                    data: name,
                    message: 'successfully created product'
                } ).header('Access-Control-Allow-Origin', '*');
            } ).catch( ( err ) => {
                reply( err.message ).header('Access-Control-Allow-Origin', '*');
            } );
        }
    },

    {
        path: '/products/{id}',
        method: 'PUT',
        config: {
            cors: {
                origin: ['*'],
                additionalHeaders: ['access-control-allow-origin' ,'x-requested-with', 'Authorization', 'content-type']
            },
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
                                } ).header('Access-Control-Allow-Origin', '*').takeover();
                            }
                            return reply.continue();
                        } );
                    }
                }
            ],
        },
        handler: ( request, reply ) => {
            const { id } = request.params ;
            const { name, price, description, image, purchase_price } = request.payload;
            const product = {name:name,price:price,description:description,image:image,purchase_price:purchase_price}

            const insertOperation = Knex( 'products' ).where( {
                id,
            } ).update( {
                name: product.name,
                price: product.price,
                purchase_price: product.purchase_price,
                image: product.image,
                description: product.description,
            } ).then( ( res ) => {

                reply( {
                    message: 'successfully updated product'
                } ).header('Access-Control-Allow-Origin', '*');
            } ).catch( ( err ) => {
                reply( 'server-side error' ).header('Access-Control-Allow-Origin', '*');
            } );
        }
    },

    {
        path: '/products/delete/{id}',
        method: 'PUT',
        config: {
            cors: {
                origin: ['*'],
                additionalHeaders: ['access-control-allow-origin' ,'x-requested-with', 'Authorization']
            },
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
                                } ).header('Access-Control-Allow-Origin', '*').takeover();
                            }
                            return reply.continue();
                        } );
                    }
                }
            ],
        },
        handler: ( request, reply ) => {
            const { id } = request.params;
            const insertOperation = Knex( 'products' ).where( {
                id,
            } ).update( {
                status: 'HIST',
            } ).then( ( res ) => {

                reply( {
                    message: 'successfully delete product'
                } ).header('Access-Control-Allow-Origin', '*');
            } ).catch( ( err ) => {
                reply( 'server-side error' ).header('Access-Control-Allow-Origin', '*');
            } );
        }
    }
];

export default routes;