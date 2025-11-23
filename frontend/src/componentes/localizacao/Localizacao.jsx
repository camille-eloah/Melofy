import { useEffect, useState } from "react";
import Header from "../layout/Header";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "./Localizacao.css";

function Localizacao() {
  const [mapStatus, setMapStatus] = useState("loading");
  const [distanceKm, setDistanceKm] = useState(null);

  const haversineKm = (a, b) => {
    const R = 6371;
    const toRad = (v) => (v * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  };

  useEffect(() => {
    try {
      const origem = { lat: -23.561684, lng: -46.656139, label: "Origem" };
      const destino = { lat: -23.55052, lng: -46.633308, label: "Destino" };
      const mapElement = document.getElementById("mapa");

      if (!mapElement) {
        console.error("Elemento #mapa nao encontrado.");
        setMapStatus("error");
        return;
      }

      // Map style com labels, ruas, cidades e POIs
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
        center: [origem.lng, origem.lat],
        zoom: 15,
      });

      const updateDistance = (lngLatA, lngLatB) => {
        const pontoA = { lat: lngLatA.lat, lng: lngLatA.lng };
        const pontoB = { lat: lngLatB.lat, lng: lngLatB.lng };
        const distancia = haversineKm(pontoA, pontoB);
        setDistanceKm(distancia);
      };

      // Adicionar marcadores (origem e destino) com drag habilitado
      const markerOrigem = new maplibregl.Marker({ draggable: true })
        .setLngLat([origem.lng, origem.lat])
        .setPopup(new maplibregl.Popup().setText(origem.label))
        .addTo(map);

      const markerDestino = new maplibregl.Marker({ draggable: true })
        .setLngLat([destino.lng, destino.lat])
        .setPopup(new maplibregl.Popup().setText(destino.label))
        .addTo(map);

      const handleDragEnd = () => {
        updateDistance(markerOrigem.getLngLat(), markerDestino.getLngLat());
      };

      markerOrigem.on("dragend", handleDragEnd);
      markerDestino.on("dragend", handleDragEnd);

      map.on("load", () => {
        updateDistance(markerOrigem.getLngLat(), markerDestino.getLngLat());
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
            <p>Nao foi possivel carregar o mapa</p>
            <small>Verifique sua conexao com a internet</small>
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
              <h2>Dados do Usuario</h2>

              <div className="info-item">
                <strong>Nome:</strong> Joao Silva
              </div>
              <div className="info-item">
                <strong>Email:</strong> joao.silva@email.com
              </div>
              <div className="info-item">
                <strong>Telefone:</strong> (11) 99999-9999
              </div>

              <div className="info-bloco-distancia">
                <h3>Distancia</h3>
                <p className="valor-destaque">
                  {distanceKm ? `${distanceKm.toFixed(2)} km` : "--"}
                </p>
              </div>

              <div className="info-bloco-endereco">
                <h3>Endereco</h3>
                <p>Rua das Flores, 123</p>
                <p>Jardim Paulista</p>
                <p>Sao Paulo - SP</p>
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
              <h3>Localizacao</h3>

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
