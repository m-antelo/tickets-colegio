"use client";

import { useState } from "react";
import { Wrench, Send, AlertCircle, CheckCircle2, Building, BookOpen, Baby, Monitor } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function NuevoTicket() {
  // Estados para la ubicación en dos pasos
  const [sector, setSector] = useState("");
  const [aula, setAula] = useState("");
  const [division, setDivision] = useState(""); // <-- Agregamos el estado para M o J
  const [errorTurno, setErrorTurno] = useState(false);


  // Resto de los estados
  const [tipoProblema, setTipoProblema] = useState("");
  const [prioridad, setPrioridad] = useState("Media");
  const [nombreAdmin, setNombreAdmin] = useState("");
  const [detalles, setDetalles] = useState("");
  
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const esAdministracion = sector === "Administración";
  const esOtroProblema = tipoProblema === "otro";
  const requiereDivision = (sector === "Primaria" || sector === "Secundaria") && aula.includes("Año");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verificación: si requiere división y no eligió ninguna, frenamos el envío
    if (requiereDivision && !division) {
      setErrorTurno(true);
      return; 
    }

    setEnviando(true);

    // Formateamos la ubicación final para la base de datos
   // Formateamos la ubicación final para la base de datos (agrega M o J si corresponde)
  const ubicacionFinal = esAdministracion 
      ? "Administración" 
      : `${sector} - ${aula}${requiereDivision && division ? ` (Turno ${division})` : ""}`;

    const { error } = await supabase
      .from('tickets')
      .insert([
        { 
          ubicacion: ubicacionFinal, 
          nombre_admin: esAdministracion ? nombreAdmin : null, 
          tipo_problema: tipoProblema, 
          detalles, 
          prioridad 
        }
      ]);

    setEnviando(false);

    if (error) {
      alert("Hubo un error al enviar el ticket. Intentá de nuevo.");
      console.error(error);
    } else {
      setEnviado(true);
      setTimeout(() => {
        setSector("");
        setAula("");
        setTipoProblema("");
        setPrioridad("Media");
        setNombreAdmin("");
        setDetalles("");
        setEnviado(false);
      }, 3000);
    }
  };

  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100 p-4 flex flex-col items-center pt-8 pb-12 font-sans selection:bg-indigo-500/30">
      <div className="bg-[#121214] p-8 rounded-3xl shadow-2xl w-full max-w-lg border border-zinc-800/80 relative overflow-hidden">
        
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-600/10 blur-[80px] rounded-full pointer-events-none"></div>

        <div className="text-center mb-10 relative z-10">
          <div className="bg-zinc-900/50 border border-zinc-800 text-indigo-400 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Wrench className="w-7 h-7" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Soporte Técnico</h1>
          <p className="text-zinc-500 text-sm mt-1.5">Reportá el problema y lo revisamos en breve.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          
          {/* 1. Selección de Sector */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-3">¿De qué sector sos?</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "Jardín", icon: Baby },
                { id: "Primaria", icon: BookOpen },
                { id: "Secundaria", icon: Building },
                { id: "Administración", icon: Monitor },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSector(s.id);
                      setAula(""); // Resetea el aula al cambiar de sector
                    }}
                    className={`py-3 px-2 rounded-xl text-sm font-medium transition-all border flex flex-col items-center gap-2 ${
                      sector === s.id
                        ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-400 shadow-sm"
                        : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {s.id}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Sub-selección (Aulas o Administración) */}
          {sector && !esAdministracion && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-sm font-medium text-zinc-400 mb-2">Seleccioná el Aula</label>
              <select 
                value={aula}
                onChange={(e) => setAula(e.target.value)}
                className="w-full bg-[#09090b] border border-zinc-800 rounded-xl p-3.5 outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/70 transition-all text-zinc-200 appearance-none"
                required
              >
                <option value="" disabled>Elegí un aula...</option>
                {sector === "Jardín" && (
                  <>
                    <option value="Sala de 2">Sala de 2</option>
                    <option value="Sala de 3">Sala de 3</option>
                    <option value="Sala de 4">Sala de 4</option>
                    <option value="Sala de 5">Sala de 5</option>
                  </>
                )}
                {(sector === "Secundaria") && (
                  <>
                    <option value="1er Año">1er Año </option>
                    <option value="2do Año">2do Año </option>
                    <option value="3er Año">3er Año </option>
                    <option value="4to Año">4to Año </option>
                    <option value="5to Año">5to Año </option>
                    <option value="6to Año">6to Año </option>
                    <option value="Gabinete informatica">Gabinete de Informática</option>
                    <option value="Laboratorio">Laboratorio</option>
                    <option value="Biblioteca">Biblioteca</option>
                  </>
                )}
                {sector === "Primaria" && (
                  <>
                    <option value="1er Grado">1er Grado </option>
                    <option value="2do Grado">2do Grado </option>
                    <option value="3er Grado">3er Grado </option>
                    <option value="4to Grado">4to Grado </option>
                    <option value="5to Grado">5to Grado </option>
                    <option value="6to Grado">6to Grado </option>
                    <option value="Sala Computacion">Sala de computación</option>
                  </>
                )}
              </select>
            </div>
          )}

          {/* Selector de Turno (M o J) - Solo aparece si es necesario */}
          {requiereDivision && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-sm font-medium text-zinc-400 mb-2">Turno / División</label>
              <div className="grid grid-cols-2 gap-3">
                {["M", "J"].map((div) => (
                  <button
                    key={div}
                    type="button"
                    onClick={() => {
                      setDivision(div);
                      setErrorTurno(false); // Oculta el error ni bien el usuario hace clic
                    }}
                    className={`py-3 px-2 rounded-xl text-sm font-medium transition-all border ${
                      division === div
                        ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-400 shadow-sm"
                        : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                    } ${
                      errorTurno && !division ? "border-rose-500/50 bg-rose-500/5 text-rose-400" : ""
                    }`}
                  >
                    Turno {div}
                  </button>
                ))}
              </div>
              
              {/* Mensaje de error visual en lugar del recuadro del navegador */}
              {errorTurno && !division && (
                <p className="text-rose-400 text-sm mt-2 flex items-center gap-1.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4" />
                  Seleccioná un elemento de la lista
                </p>
              )}
            </div>
          )}

          {esAdministracion && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300 bg-indigo-950/20 p-4 rounded-xl border border-indigo-900/30">
              <label className="block text-sm font-medium text-indigo-300 mb-2">
                Indicá tu Oficina y Referencia (Requerido)
              </label>
              <input 
                type="text" 
                value={nombreAdmin}
                onChange={(e) => setNombreAdmin(e.target.value)}
                placeholder="Ej: Dirección Primaria - Escritorio de Ana" 
                className="w-full bg-[#09090b] border border-zinc-800 rounded-xl p-3.5 outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/70 transition-all text-zinc-200 placeholder:text-zinc-600"
                required
              />
            </div>
          )}

          {/* El resto sigue igual... */}
          {sector && (
            <div className="animate-in fade-in duration-300 space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">¿Qué falla?</label>
                <select 
                  value={tipoProblema}
                  onChange={(e) => setTipoProblema(e.target.value)}
                  className="w-full bg-[#09090b] border border-zinc-800 rounded-xl p-3.5 outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/70 transition-all text-zinc-200 appearance-none"
                  required
                >
                  <option value="" disabled>Seleccioná el problema...</option>
                  <option value="internet">No hay internet / Wi-Fi</option>
                  <option value="pc_no_prende">La compu no enciende</option>
                  <option value="pc_lenta">La compu anda lenta</option>
                  <option value="pc_reinicia">La compu tira pantalla azul con una carita triste </option>
                  <option value="audio">Problema con audio</option>
                  <option value="programas">Me faltan programas (especificar) </option>
                  <option value="Impresora">Problemas con la impresora (especificar) </option>
                  <option value="otro">Otro tipo de problema</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  {esOtroProblema ? "Describí el problema (Requerido)" : "Detalles adicionales (Opcional)"}
                </label>
                <textarea 
                  rows={3}
                  value={detalles}
                  onChange={(e) => setDetalles(e.target.value)}
                  placeholder={esOtroProblema ? "Explicá qué está pasando..." : "Ej: Hace un ruido raro, me tira un error..."}
                  className="w-full bg-[#09090b] border border-zinc-800 rounded-xl p-3.5 outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/70 transition-all text-zinc-200 placeholder:text-zinc-600 resize-none"
                  required={esOtroProblema}
                ></textarea>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-400 mb-3">
                  <AlertCircle className="w-4 h-4" />
                  Nivel de Urgencia
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["Baja", "Media", "Alta"].map((nivel) => (
                    <button
                      key={nivel}
                      type="button"
                      onClick={() => setPrioridad(nivel)}
                      className={`py-2.5 px-2 rounded-xl text-sm font-medium transition-all border ${
                        prioridad === nivel
                          ? nivel === "Baja"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : nivel === "Media"
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                            : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                          : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                      }`}
                    >
                      {nivel}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={enviando || enviado}
                className={`w-full font-medium rounded-xl p-4 transition-all mt-6 flex items-center justify-center gap-2 shadow-lg ${
                  enviado 
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-indigo-600 text-white hover:bg-indigo-500 active:scale-[0.98] shadow-indigo-900/20"
                }`}
              >
                {enviado ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Ticket Enviado
                  </>
                ) : enviando ? (
                  "Enviando..."
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Enviar Ticket
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </main>
  );
}