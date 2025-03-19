import React from "react";
import "../Card/style.css";
import SmallRght from "../../assets/small-right.svg";

const Card = ({image,titulo,text}) => {
    return (
        <div className="card-container">
            <img src={image} alt="" className="img-container" />
            <div className="description">
                <h2 className="title-card">{titulo}</h2>
                <p className="text">{text}</p>
                <div className="itens">
                    <span className="bottom">
                        <p>Leia mais</p>
                        <img src={SmallRght} alt="" className="icon"/>
                    </span>
                </div>
            </div>
            
        </div>
    );
}

export default Card;