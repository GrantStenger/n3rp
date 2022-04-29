import React from "react";
import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

const Rentals = () => {
    return (
        <div className="flex bg-white-100 flex-col justify-start h-screen">
            <Navbar />
            <MyListingsView />
            <MyRentalsView />
            <div className="flex flex-col items-center">
                <Footer />
            </div>
        </div>
    );
}

const MyListingsView = () => {
    return (
        <div className="m-20 space-y-6">
            <h1 className="text-4xl font-bold">My Listings</h1>
            {/* TODO: Check if user has listed NFTs */}
            <p>You haven't listed any NFTs!</p>
            <div>
                <Link to="/create" className="bg-indigo-800 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">List a Rental</Link>
            </div>
        </div>
    );
}

const MyRentalsView = () => {
    return (
        <div className="m-20 space-y-6">
            <h1 className="text-4xl font-bold">My Rentals</h1>
            {/* TODO: Check if user has rented NFTs */}
            <p>You haven't rented any NFTs!</p>
            <div>
                <Link to="/find" className="bg-indigo-800 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">Explore Current Rentals!</Link>
            </div>
        </div>
    );
}

export default Rentals;