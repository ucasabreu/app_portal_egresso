import React, { useState } from 'react';
import { FaEnvelope, FaLinkedin, FaInstagram, FaFileAlt } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../../pages/Egresso/styles.css";
import placeholderImg from "../../assets/ooui--user-avatar.png"
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import { API_URL } from '../../config/config.js';

const EditEgresso = () => {
  const navigate = useNavigate();
  const [egresso, setEgresso] = useState({
    foto: '',
    nome: '',
    email: '',
    linkedin: '',
    instagram: '',
    curriculo: '',
    descricao: ''
  });
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEgresso({ ...egresso, [name]: value });
  };

  const handlePhotoChange = (e) => {
    setEgresso({ ...egresso, foto: e.target.value });
  };

  const handleSaveEgresso = async () => {
    setErrorMessage("");
    try {
      
      const fotoFinal = egresso.foto || placeholderImg;

      const response = await axios.post(`${API_URL}/api/egressos/salvar/egresso`, {
        nome: egresso.nome,
        instagram: egresso.instagram,
        linkedin: egresso.linkedin,
        email: egresso.email,
        curriculo: egresso.curriculo,
        foto: fotoFinal,
        descricao: egresso.descricao
      });

      const savedEgresso = response.data;
      console.log('Dados do egresso salvos:', savedEgresso);
      navigate(`/egresso/${savedEgresso.id_egresso}`);
    } catch (error) {
      console.error('Erro ao salvar os dados do egresso:', error);
      if (error.response?.data) {
        const data = error.response.data;
        if (typeof data === 'object' && !Array.isArray(data)) {
          // Converte o objeto em array de mensagens
          const messages = Object.values(data);
          setErrorMessage(messages);
        } else if (typeof data === 'string') {
          setErrorMessage([data]);
        } else {
          setErrorMessage(["Erro ao salvar os dados do egresso."]);
        }
      } else {
        setErrorMessage(["Erro ao salvar os dados do egresso."]);
      }
    }
  };

  const handleConfirm = () => {
    setIsConfirmed(true);
  };

  return (
    <div className="container_principal">
      <header className='header_egressoview'>
        <h1>Editar Egresso</h1>
      </header>

      <div className='container_egresso'>
        {/* ✅ Exibe erro de forma estilizada */}
        {errorMessage && (
          <div className="error-message">
            {Array.isArray(errorMessage) ? (
              errorMessage.map((msg, index) => (
                <p key={index}>⚠ Atenção: {msg}</p>
              ))
            ) : (
              <p key={index}>⚠ Atenção: {msg}</p>
            )}
          </div>
        )}

        <form onSubmit={(e) => e.preventDefault()}>
          <div className="egresso-header">
            <img
              src={egresso.foto || placeholderImg}
              alt={egresso.nome || "Foto do egresso"}
              className="egresso-photo"
            />
            <div>
              <label>
                Foto:
                <Input type="url" name="foto" value={egresso.foto} onChange={handleChange} placeholder="Cole o link da sua foto"/>
              </label>

              <label>
                Nome:
                <Input type="text" name="nome" value={egresso.nome} onChange={handleChange} placeholder="Insira seu nome" />
              </label>

              <label>
                <FaEnvelope className="icon" /> Email:
                <Input type="email" name="email" value={egresso.email} onChange={handleChange} placeholder="E-mail" />
              </label>

              <label>
                <FaLinkedin className="icon" /> LinkedIn:
                <Input type="url" name="linkedin" value={egresso.linkedin} onChange={handleChange} placeholder="Link do LinkedIn" />
              </label>

              <label>
                <FaInstagram className="icon" /> Instagram:
                <Input type="url" name="instagram" value={egresso.instagram} onChange={handleChange} placeholder="Link do Instagram" />
              </label>

              <label>
                <FaFileAlt className="icon" /> Currículo:
                <Input type="url" name="curriculo" value={egresso.curriculo} onChange={handleChange} placeholder="Link do Currículo" />
              </label>

              <label>
                Descrição:
                <textarea
                  name="descricao"
                  value={egresso.descricao}
                  onChange={handleChange}
                  placeholder="Escreva uma breve descrição sobre você"
                  rows="4"
                  style={{ width: "100%", padding: "10px", borderRadius: "8px" }}
                />
              </label>
            </div>
          </div>

          {!isConfirmed ? (
            <div className='button-confirm'>
              <Button type="button" onClick={handleConfirm}>Confirmar Dados</Button>
            </div>
          ) : (
            <div className='button-confirm'>
              <Button type="button" onClick={handleSaveEgresso}>Salvar Egresso</Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default EditEgresso;
