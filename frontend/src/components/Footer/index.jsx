import React from "react";
import "../Footer/FooterStyle.css";

const Footer = () => {
    return (
        <div className="container_footer">
            <footer className="footer">
            <p>&copy; {new Date().getFullYear()} Portal Egressos - Todos os direitos reservados.</p>
        </footer>
        </div>
        
        
    
    )

}

export default Footer;
