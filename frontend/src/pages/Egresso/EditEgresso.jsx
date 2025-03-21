import React, { useState } from 'react';
import { FaEnvelope, FaLinkedin, FaInstagram, FaFileAlt } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../../pages/Egresso/styles.css";
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import { API_URL } from '../../config';


const EditEgresso = () => {
  const navigate = useNavigate();
  const [egresso, setEgresso] = useState({
    foto: '',
    nome: '',
    email: '',
    linkedin: '',
    instagram: '',
    curriculo: '',
  });
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // Adiciona estado para mensagens de erro

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEgresso({ ...egresso, [name]: value });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setEgresso({ ...egresso, foto: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEgresso = async () => {
    setErrorMessage(""); // Limpa mensagens de erro antes de salvarb
    try {
      const response = await axios.post(`${API_URL}/api/egressos/salvar/egresso`, {
        nome: egresso.nome,
        instagram: egresso.instagram,
        linkedin: egresso.linkedin,
        email: egresso.email,
        curriculo: egresso.curriculo,
        foto: egresso.foto,
      });

      const savedEgresso = response.data;

      console.log('Dados do egresso salvos:', savedEgresso);

      // Navegar para a página do egresso com o ID correto
      navigate(`/egresso/${savedEgresso.id_egresso}`);

    } catch (error) {
      console.error('Erro ao salvar os dados do egresso:', error);
      const errorMessage =
        error.response?.data || 
        `Erro ${error.response?.status}: ${error.response?.statusText}` ||
        "Erro ao salvar os dados do egresso. Verifique sua conexão ou tente novamente mais tarde.";
      setErrorMessage(errorMessage);
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
        {errorMessage && <div className="error-message">{errorMessage}</div>} {/* Exibe mensagem de erro */}
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="egresso-header">
            <img 
              src={egresso.foto || "default-image-path.jpg"} 
              alt={egresso.nome || "Foto do egresso"} 
              className="egresso-photo" 
            />
            <div>
              <label>
                Foto:
                <input type="file" accept="image/*" onChange={handlePhotoUpload} />
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
            </div>
          </div>

          {!isConfirmed ? (
            <Button type="button" onClick={handleConfirm}>Confirmar Dados</Button>
          ) : (
            <Button type="button" onClick={handleSaveEgresso}>Salvar Egresso</Button>
          )}
        </form>
      </div>
    </div>
  );
};

export default EditEgresso;
