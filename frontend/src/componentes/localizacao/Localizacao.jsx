import { useEffect, useState } from "react";
import Header from "../layout/Header";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "./Localizacao.css";

function Localizacao() {
  const [mapStatus, setMapStatus] = useState("loading");

  useEffect(() => {
    try {
      const endereco = { lat: -23.561684, lng: -46.656139 };
      const mapElement = document.getElementById("mapa");

      if (!mapElement) {
        console.error("Elemento #mapa não encontrado.");
        setMapStatus("error");
        return;
      }

      // 🔥 STYLE COMPLETO COM LABELS, RUAS, CIDADES, POIs etc.
      const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_API_KEY;

      if (!MAPTILER_KEY) {
        console.error("Chave MapTiler ausente. Defina VITE_MAPTILER_API_KEY no .env.");
        setMapStatus("error");
        return;
      }
      const STYLE_URL = `https://api.maptiler.com/maps/basic-v2/style.json?key=${MAPTILER_KEY}`;

      const map = new maplibregl.Map({
        container: mapElement,
        style: STYLE_URL,
        center: [endereco.lng, endereco.lat],
        zoom: 15,
      });

      // 📍 Adicionar marcador
      new maplibregl.Marker()
        .setLngLat([endereco.lng, endereco.lat])
        .addTo(map);

      map.on("load", () => {
        console.log("Mapa vetorial (MapTiler) carregado com labels!");
        setMapStatus("loaded");
      });

    } catch (error) {
      console.error("Erro ao inicializar MapLibre:", error);
      setMapStatus("error");
    }
  }, []);

  const renderMapOverlay = () => {
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
            <p>Não foi possível carregar o mapa</p>
            <small>Verifique sua conexão com a internet</small>
          </div>
        );
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
                <div id="mapa" style={{ width: "100%", height: "100%" }}></div>
                {renderMapOverlay()}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Localizacao;
