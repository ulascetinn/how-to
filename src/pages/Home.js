import React from "react";
import Header from "../components/Header";
import LinkBox from "../components/LinkBox";

export default function Home() {
    return (
        <div>
            <Header />
            <div className="container">
                <LinkBox to="/calculator" label="Calculator" />
                <LinkBox to="/needle-valve" label="Needle Valve" /> {/* Add the new link */}
                <LinkBox to="/air-release-valve-placement" label="Air Release Valve Placement" />
                <LinkBox to="/flow-graphs" label="Flow Graphs" />
                <LinkBox to="/technical-drawings" label="Technical Drawings" />
            </div>
        </div>
    );
}
