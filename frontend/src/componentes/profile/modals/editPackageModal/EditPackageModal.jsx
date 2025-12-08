// EditPackageModal.jsx
import "./EditPackageModal.css";
import Swal from "sweetalert2";

function EditPackageModal({
  open,
  onClose,
  pacote,
  onChange,
  onSubmit,
}) {
  if (!open) return null;

  const handleSubmit = async () => {
    try {
      // Proteções contra undefined + trim seguro
      const nome = (pacote?.pac_nome || "").toString().trim();
      const quantidade = Number(pacote?.pac_quantidade_aulas);
      const valor = Number(pacote?.pac_valor_total);

      if (!nome) {
        await Swal.fire({
          icon: "warning",
          title: "Campo obrigatório",
          text: "Informe o nome do pacote",
          confirmButtonColor: "#3085d6",
          didRender: (modal) => {
            const backdrop = document.querySelector(".swal2-container");
            if (backdrop) backdrop.style.zIndex = "9999";
          },
        });
        return;
      }

      if (!Number.isFinite(quantidade) || quantidade < 1) {
        await Swal.fire({
          icon: "warning",
          title: "Quantidade inválida",
          text: "Informe pelo menos 1 aula",
          confirmButtonColor: "#3085d6",
          didRender: (modal) => {
            const backdrop = document.querySelector(".swal2-container");
            if (backdrop) backdrop.style.zIndex = "9999";
          },
        });
        return;
      }

      if (!Number.isFinite(valor) || valor <= 0) {
        await Swal.fire({
          icon: "warning",
          title: "Valor inválido",
          text: "Informe um valor maior que 0",
          confirmButtonColor: "#3085d6",
          didRender: (modal) => {
            const backdrop = document.querySelector(".swal2-container");
            if (backdrop) backdrop.style.zIndex = "9999";
          },
        });
        return;
      }

      // mostra feedback de sucesso (aguarda fechar automatico)
      await Swal.fire({
        icon: "success",
        title: "Pacote atualizado!",
        showConfirmButton: false,
        timer: 1200,
        timerProgressBar: true,
        didRender: (modal) => {
          const backdrop = document.querySelector(".swal2-container");
          if (backdrop) backdrop.style.zIndex = "9999";
        },
      });

      // Chamamos onSubmit — pode ser síncrono ou assíncrono.
      // Se onSubmit for async e retornar true/false, aguardamos e checamos.
      let result;
      try {
        result = onSubmit ? await onSubmit({ nome, quantidade, valor }) : true;
      } catch (err) {
        // Se onSubmit falhar (lançar), o erro já foi tratado por handleEditPacote
        // Apenas não fechamos o modal
        console.error("onSubmit falhou:", err);
        return;
      }

      // Se o onSubmit explicitamente retornou false => não fechamos
      if (result === false) {
        // o onSubmit já deve ter mostrado o erro; apenas retornamos para não fechar
        return;
      }

      // sucesso: fecha modal
      onClose();
    } catch (err) {
      // Erro inesperado
      console.error("Erro ao submeter edição de pacote:", err);
      await Swal.fire({
        icon: "error",
        title: "Erro inesperado",
        text: "Ocorreu um erro. Veja o console para mais detalhes.",
        didRender: (modal) => {
          const backdrop = document.querySelector(".swal2-container");
          if (backdrop) backdrop.style.zIndex = "9999";
        },
      });
    }
  };

  return (
    <div className="pacote-modal-overlay" onClick={onClose}>
      <div
        className="pacote-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Editar Pacote de Aula</h3>

        <div className="pacote-input-group">
          <label>Nome ou Descrição do Pacote</label>
          <input
            type="text"
            placeholder="Ex.: Pacote Mensal Premium"
            value={pacote?.pac_nome || ""}
            onChange={(e) => onChange({ ...pacote, pac_nome: e.target.value })}
          />
        </div>

        <div className="pacote-input-group">
          <label>Quantidade de Aulas</label>
          <input
            type="number"
            min={1}
            placeholder="Ex.: 4"
            value={pacote?.pac_quantidade_aulas || ""}
            onChange={(e) =>
              onChange({
                ...pacote,
                pac_quantidade_aulas: e.target.value === "" ? "" : Number(e.target.value),
              })
            }
          />
        </div>

        <div className="pacote-input-group">
          <label>Valor Total (R$)</label>
          <input
            type="number"
            placeholder="Ex.: 280"
            value={pacote?.pac_valor_total || ""}
            onChange={(e) =>
              onChange({
                ...pacote,
                pac_valor_total: e.target.value === "" ? "" : Number(e.target.value),
              })
            }
          />
        </div>

        <button className="pacote-btn-confirmar" onClick={handleSubmit}>
          Salvar Alterações
        </button>

        <button className="pacote-btn-cancelar" onClick={onClose}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

export default EditPackageModal;
