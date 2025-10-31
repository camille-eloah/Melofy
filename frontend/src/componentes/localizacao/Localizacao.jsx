import { useEffect } from "react";
import "./Localizacao.css";

function Localizacao() {
  useEffect(() => {
    const initMap = () => {
      const endereco = { lat: -23.561684, lng: -46.656139 }; // São Paulo

      const map = new window.google.maps.Map(document.getElementById("mapa"), {
        zoom: 15,
        center: endereco,
      });

      new window.google.maps.Marker({
        position: endereco,
        map,
        title: "Rua das Flores, 123 - São Paulo",
      });
    };

    if (!window.google) {
      const script = document.createElement("script");
      script.src =
        "https://maps.googleapis.com/maps/api/js?key=AIzaSyB0pUTdpJmnAIw2cGQpu9SZLmCzKnu5HW4&callback=initMap";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      window.initMap = initMap;
    } else {
      initMap();
    }
  }, []);

  return (
    <div className="localizacao-container">
      <header className="cabecalho-azul">
        <h1>Melofy</h1>
        <div className="botoes-esquerda">
          <button className="botao-cabecalho">Dar Aulas</button>
          <button className="botao-cabecalho">Conectar</button>
        </div>
      </header>

      <main className="conteudo-principal">
        <div className="lado-esquerdo">
          <div className="dados-usuario">
            <h2>Dados do Usuário</h2>

            <div className="info-item">
              <strong>Nome:</strong> João Silva
            </div>
            <div className="info-item">
              <strong>Email:</strong> joao.silva@email.com
            </div>
            <div className="info-item">
              <strong>Telefone:</strong> (11) 99999-9999
            </div>

            <div className="info-bloco-distancia">
              <h3>Distância</h3>
              <p className="valor-destaque">5,2 km</p>
            </div>

            <div className="info-bloco-endereco">
              <h3>Endereço</h3>
              <p>Rua das Flores, 123</p>
              <p>Jardim Paulista</p>
              <p>São Paulo - SP</p>
              <p>CEP: 01420-001</p>
            </div>

            <div className="total-container">
              <span>Total:</span>
              <strong>R$ 49,90</strong>
            </div>
          </div>
        </div>


        <div className="lado-direito">
          <div className="mapa-container">
            <h3>Mapa</h3>
            <div id="mapa" className="mapa-placeholder"></div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Localizacao;
