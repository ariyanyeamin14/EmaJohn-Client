import React, { useEffect, useState } from 'react';
import { addToDb, deleteShoppingCart, getShoppingCart } from '../../utilities/fakedb';
import Cart from '../Cart/Cart';
import Product from '../Product/Product';
import './Shop.css';
import { Link, useLoaderData } from 'react-router-dom';

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([])
    const { count } = useLoaderData()
    const [itemsPerPage, setItemsPerPage] = useState(9);
    const numberOfPages = Math.ceil(count / itemsPerPage);
    const [currentPage, setCurrentPage] = useState(0)
    const storedCart = getShoppingCart();
    const [newStoredCart, setNewStoredCart] = useState()


    // const pages = [];
    // for( let i = 0; i < numberOfPages; i++){
    //     pages.push(i)
    // }
    const pages = [...Array(numberOfPages).keys()]


    useEffect(() => {
        fetch(`http://localhost:5000/products?page=${currentPage}&size=${itemsPerPage}`)
            .then(res => res.json())
            .then(data => setProducts(data))
    }, [currentPage, itemsPerPage]);

    useEffect(() => {
        const storedCartIds = Object.keys(storedCart)
        const queryString = storedCartIds.map(id => `id=${id}`).join('&');

        if (queryString) {
            fetch(`http://localhost:5000/data?${queryString}`)
                .then(res => res.json())
                .then(data => {
                    setNewStoredCart(data)
                })
        }
    }, [])

    const handleAddToCart = (product) => {

        const storedCartIds = Object.keys(storedCart)

        const NewStoredCartIds = [...storedCartIds, product._id]
        const queryString = NewStoredCartIds.map(id => `id=${id}`).join('&');

        // cart.push(product); '
        let newCart = [];
        // const newCart = [...cart, product];
        // if product doesn't exist in the cart, then set quantity = 1
        // if exist update quantity by 1
        const exists = cart.find(pd => pd._id === product._id);
        if (!exists) {
            product.quantity = 1;
            newCart = [...cart, product]
        }
        else {
            exists.quantity = exists.quantity + 1;
            const remaining = cart.filter(pd => pd._id !== product._id);
            newCart = [...remaining, exists];
        }

        setCart(newCart);
        addToDb(product._id)

        fetch(`http://localhost:5000/data?${queryString}`)
            .then(res => res.json())
            .then(data => setNewStoredCart(data))
    }

    const handleClearCart = () => {
        setNewStoredCart([]);
        deleteShoppingCart();
    }

    const handleItemsPerPage = (e) => {
        const value = parseInt(e.target.value)
        setItemsPerPage(value)
        setCurrentPage(0)
    }

    const handlePrevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1)
        }
    }

    const handleNextPage = () => {
        if (currentPage < pages.length - 1) {
            setCurrentPage(currentPage + 1)
        }
    }

    return (
        <div className='shop-container'>
            <div className="products-container">
                {
                    products.map(product => <Product
                        key={product._id}
                        product={product}
                        handleAddToCart={handleAddToCart}
                    ></Product>)
                }
            </div>
            <div className="cart-container">
                <Cart
                    cart={newStoredCart}
                    handleClearCart={handleClearCart}
                >
                    <Link className='proceed-link' to="/orders">
                        <button className='btn-proceed'>Review Order</button>
                    </Link>
                </Cart>
            </div>

            <div className='pagination'>
                <p>{currentPage}</p>
                <button onClick={handlePrevPage}>Prev</button>
                {
                    pages.map(page => <button
                        className={currentPage === page ? 'selected' : undefined}
                        onClick={() => setCurrentPage(page)}
                        key={page}
                    > {page} </button>)
                }
                <button onClick={handleNextPage}>Next</button>
                <select value={itemsPerPage} onChange={handleItemsPerPage} name="" id="">
                    <option value="6">6</option>
                    <option value="9">9</option>
                    <option value="18">18</option>
                    <option value="30">30</option>
                    <option value="48">48</option>
                </select>
            </div>
        </div>
    );
};

export default Shop;