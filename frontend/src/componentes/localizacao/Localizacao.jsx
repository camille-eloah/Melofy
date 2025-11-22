import { useEffect, useState } from "react";
import Header from "../layout/Header";
import "./Localizacao.css";

function Localizacao() {
  const [mapStatus, setMapStatus] = useState("loading"); 

  useEffect(() => {
    const initMap = () => {
      try {
        const endereco = { lat: -23.561684, lng: -46.656139 };

        const map = new window.google.maps.Map(document.getElementById("mapa"), {
          zoom: 15,
          center: endereco,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
        });

        new window.google.maps.Marker({
          position: endereco,
          map: map,
          title: "Rua das Flores, 123 - São Paulo",
        });

        setMapStatus("loaded");
        console.log("Mapa carregado com sucesso!");
      } catch (error) {
        console.error("Erro ao inicializar mapa:", error);
        setMapStatus("error");
      }
    };

    
    const loadGoogleMaps = () => {
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyB0pUTdpJmnAIw2cGQpu9SZLmCzKnu5HW4`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log("Google Maps API carregada");
        initMap();
      };
      
      script.onerror = () => {
        console.error("Erro ao carregar Google Maps API");
        setMapStatus("error");
      };
      
      document.head.appendChild(script);
    };

    if (window.google && window.google.maps) {
      initMap();
    } else {
      loadGoogleMaps();
    }

  }, []);

  const renderMapContent = () => {
    switch (mapStatus) {
      case "loading":
        return (
          <div className="mapa-loading">
            <p>Carregando mapa...</p>
          </div>
        );
      case "error":
        return (
          <div className="mapa-error">
            <p>⚠️ Não foi possível carregar o mapa</p>
            <small>Verifique sua conexão com a internet</small>
          </div>
        );
      case "loaded":
        return <div id="mapa" style={{ width: '100%', height: '100%' }}></div>;
      default:
        return null;
    }
  };

  return (
    <div className="localizacao-page">
      <div className="localizacao-container">
      <Header />

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
            <h3>Localização</h3>
            <div className="mapa-wrapper">
              {renderMapContent()}
            </div>
          </div>
        </div>
      </main>
      </div>
    </div>
  );
}

export default Localizacao;
