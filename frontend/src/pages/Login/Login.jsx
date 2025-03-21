import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Hook para redirecionamento
import "./Login.css"; 
import API_URL from "../../config/config";


const LoginCoordenador = () => {
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [tipo, setTipo] = useState("coordenador");
  const [error, setError] = useState("");
  const [isCadastro, setIsCadastro] = useState(false);
  
  const navigate = useNavigate(); // Hook para navegação

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isCadastro) {
        // Cadastro de coordenador
        await axios.post(`${API_URL}/api/coordenadores/salvar/coordenador`, {
          login,
          senha,
          tipo,
        });
        alert("Cadastro realizado com sucesso! Faça login.");
        setIsCadastro(false);
      } else {
        // Buscar coordenador pelo login e senha
        const response = await axios.get(`${API_URL}/api/coordenadores/buscar/coordenador`, {
          params: { login, senha },
        });
        const { id_coordenador: idCoordenador, tipo } = response.data;

        alert("Login bem-sucedido!");

        // Verificar o tipo do coordenador e redirecionar
        if (tipo === "geral") {
          navigate(`/coordenador_geral/${idCoordenador}`);
        } else {
          navigate(`/coordenador/${idCoordenador}`);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao processar a solicitação.");
    }
  };

  return (
    <div className="container_login">
      <div className="login">
        <form className="login-form" onSubmit={handleAuth}>
            <h2>{isCadastro ? "Cadastro de Coordenador" : "Login de Coordenador"}</h2>
            {error && <p className="error-message">{error}</p>}
            <input
                type="text"
                placeholder="Login"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                required
            />
            <input
                type="password"
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
            />
            {isCadastro && (
            <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                <option value="coordenador">Coordenador</option>
                <option value="geral">Coordenador Geral</option>
            </select>
            )}
            <button type="submit">{isCadastro ? "Cadastrar" : "Login"}</button>
            <p className="toggle-text" onClick={() => setIsCadastro(!isCadastro)}>
            {isCadastro ? "Já tem uma conta? Faça login!" : "Não tem uma conta? Cadastre-se!"}
            </p>
        </form>
      </div>
    </div>
  );
};

export default LoginCoordenador;
