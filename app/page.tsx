"use client";

import { useState } from "react";
import { Wrench, Send, AlertCircle, CheckCircle2, Building, BookOpen, Baby, Monitor, Info, ChevronDown} from "lucide-react";
import { supabase } from "../lib/supabase";

export default function NuevoTicket() {
  // Estados para la ubicación en dos pasos
  const [sector, setSector] = useState("");
  const [aula, setAula] = useState("");
  const [division, setDivision] = useState(""); // <-- Agregamos el estado para M o J
  const [errorTurno, setErrorTurno] = useState(false);
  const [telefono, setTelefono] = useState("");


  // Resto de los estados
  const [tipoProblema, setTipoProblema] = useState("");
  const [prioridad, setPrioridad] = useState("Media");
  const [nombreAdmin, setNombreAdmin] = useState("");
  const [detalles, setDetalles] = useState("");
  const [errorTelefono, setErrorTelefono] = useState(false);
  
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  //listas de problemas y aulas
  const [dropdownProblema, setDropdownProblema] = useState(false);
  const [dropdownAula, setDropdownAula] = useState(false);

  const esAdministracion = sector === "Administración";
  const esOtroProblema = tipoProblema === "Otro tipo de problema";
  const requiereDivision = (sector === "Primaria" || sector === "Secundaria") && (aula.includes("Año") || aula.includes ("Grado") || aula === "Intermedio");
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verificación: si requiere división y no eligió ninguna, frenamos el envío
    if (requiereDivision && !division) {
      setErrorTurno(true);
      return; 
    }


    if (telefono) {
      const soloNumeros = telefono.replace(/\D/g, ""); // Borra espacios, guiones o letras
      if (soloNumeros.length !== 10) {
        setErrorTelefono(true);
        return; // Corta la ejecución acá y no envía el formulario
      }
    }
    setErrorTelefono(false);

    setEnviando(true);

    // Formateamos la ubicación final para la base de datos
   // Formateamos la ubicación final para la base de datos (agrega M o J si corresponde)
    const ubicacionFinal = esAdministracion 
      ? "Administración" 
      : `${sector} - ${aula}${requiereDivision && division ? ` (Turno ${division})` : ""}`;
    

    // Validación del teléfono (solo si el profe escribió algo)
 // Si todo está bien, limpia el error

    // ... acá sigue tu código de Supabase

    const { error } = await supabase
      .from('tickets')
      .insert([
        { 
          ubicacion: ubicacionFinal, 
          nombre_admin: esAdministracion ? nombreAdmin : null, 
          tipo_problema: tipoProblema, 
          detalles, 
          prioridad,
          telefono: telefono,
        }
      ]);
      

    setEnviando(false);

    if (error) {
      alert("Hubo un error al enviar el ticket. Intentá de nuevo.");
      console.error(error);
    } else {
      setEnviado(true);

      // 3. AVISAMOS A DISCORD
      const webhookUrl = "https://discord.com/api/webhooks/1555958185066635326/WitgMImN1qDBuBKtVgWdWPpkXaPUe8X34-DYaAtkkzYgNKRd8c_GQ1MRaU5VppXxC8wU";
      const mensajeDiscord = {
        content: `🚨 **¡NUEVO TICKET DE SOPORTE!** 🚨\n\n📍 **Ubicación:** ${ubicacionFinal}\n🔥 **Problema:** ${tipoProblema.replace('_', ' ')}\n📝 **Detalles:** ${detalles || "Sin detalles adicionales"}\n⚡ **Prioridad:** ${prioridad}${telefono ? `\n📱 **WhatsApp:** ${telefono}` : ""}`
      };

      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mensajeDiscord)
      }).catch(err => console.error("Error avisando a Discord:", err));

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
          <p className="text-zinc-500 text-sm mt-1.5">Reportá el problema y Mateo lo revisará en la semana.</p>
        </div>

        {/* Recuadro informativo */}
        <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-2xl p-5 mb-8 relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-indigo-300">¿Cómo funciona este sistema de reportes?</h3>
          </div>
          <ul className="space-y-2 text-sm text-zinc-400 pl-7 list-disc marker:text-indigo-500/50">
            <li>Cargá el problema y le llega directamente a <strong className="text-zinc-300">Mateo.</strong> 
            </li>
            <li>
              Mateo Suele estar en el colegio los <strong className="text-zinc-300">Jueves en el horario del mediodía</strong> 
            </li>
            <li>
              Ante cualquier duda o urgencia, avisen a <strong className="text-zinc-300">Toti</strong> o a <strong className="text-zinc-300">Guada</strong> y ellos hablan con Mateo directamente.
            </li>
            <li>
              <strong className="text-zinc-300">Si la computadora tiene contraseña indicarla en detalles adicionales</strong>
            </li>

          </ul>
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
{/* 2. Sub-selección (Aulas o Administración) */}
          {sector && !esAdministracion && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300 relative z-20">
              <label className="block text-sm font-medium text-zinc-400 mb-2">Seleccioná el Aula</label>
              
              {/* Botón principal que simula el select */}
              <div 
                onClick={() => setDropdownAula(!dropdownAula)}
                className={`w-full bg-[#09090b] border rounded-xl p-3.5 flex justify-between items-center cursor-pointer transition-all ${
                  dropdownAula ? "border-indigo-500/70 ring-1 ring-indigo-500/70" : "border-zinc-800 hover:border-indigo-500/50"
                }`}
              >
                <span className={aula ? "text-zinc-200" : "text-zinc-500"}>
                  {aula || "Elegí un aula..."}
                </span>
                <ChevronDown className={`w-5 h-5 text-zinc-500 transition-transform duration-300 ${dropdownAula ? "rotate-180" : ""}`} />
              </div>

              {/* Lista desplegable flotante de Aulas */}
              {dropdownAula && (
                <div className="absolute z-50 w-full mt-2 bg-[#121214] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                  
                  {/* Lista para Jardín */}
                  {sector === "Jardín" && ["Sala de 2", "Sala de 3", "Sala de 4", "Sala de 5"].map((opcion) => (
                    <div
                      key={opcion}
                      onClick={() => {
                        setAula(opcion);
                        setDropdownAula(false);
                      }}
                      className={`p-3.5 cursor-pointer transition-all text-sm border-b border-zinc-800/50 last:border-0 hover:bg-indigo-600/10 hover:text-indigo-300 ${
                        aula === opcion ? "bg-indigo-600/20 text-indigo-400 font-medium" : "text-zinc-300"
                      }`}
                    >
                      {opcion}
                    </div>
                  ))}

{/* Lista para Primaria */}
                  {sector === "Primaria" && [
                    "1er Grado", "2do Grado", "3er Grado", "4to Grado", "5to Grado", "6to Grado", 
                    "Biblioteca", "Sala de computación", "Sala de Maestros", "Otro salón (especificar)"
                  ].map((opcion) => (
                    <div
                      key={opcion}
                      onClick={() => {
                        setAula(opcion);
                        setDropdownAula(false);
                      }}
                      className={`p-3.5 cursor-pointer transition-all text-sm border-b border-zinc-800/50 last:border-0 hover:bg-indigo-600/10 hover:text-indigo-300 ${
                        aula === opcion ? "bg-indigo-600/20 text-indigo-400 font-medium" : "text-zinc-300"
                      }`}
                    >
                      {opcion}
                    </div>
                  ))}

                  {/* Lista para Secundaria */}
                  {sector === "Secundaria" && [
                    "1er Año", "2do Año", "3er Año", "4to Año", "5to Año", "Intermedio", 
                    "Auxiliar", "Sala de Arte", "Biblioteca", "Sala de Profes", "Gabinete informática", "Otro Aula (especificar)"
                  ].map((opcion) => (
                    <div
                      key={opcion}
                      onClick={() => {
                        setAula(opcion);
                        setDropdownAula(false);
                      }}
                      className={`p-3.5 cursor-pointer transition-all text-sm border-b border-zinc-800/50 last:border-0 hover:bg-indigo-600/10 hover:text-indigo-300 ${
                        aula === opcion ? "bg-indigo-600/20 text-indigo-400 font-medium" : "text-zinc-300"
                      }`}
                    >
                      {opcion}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          

          {/* Selector de Turno (M o J) - Solo aparece si es necesario */}
          {requiereDivision && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-sm font-medium text-zinc-400 mb-2">División</label>
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
                    Division {div}
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
                <div className="relative">
                <label className="block text-sm font-medium text-zinc-400 mb-2">¿Qué falla?</label>
                
                {/* Botón principal que simula el select */}
                <div 
                  onClick={() => setDropdownProblema(!dropdownProblema)}
                  className={`w-full bg-[#09090b] border rounded-xl p-3.5 flex justify-between items-center cursor-pointer transition-all ${
                    dropdownProblema ? "border-indigo-500/70 ring-1 ring-indigo-500/70" : "border-zinc-800 hover:border-indigo-500/50"
                  }`}
                >
                  <span className={tipoProblema ? "text-zinc-200" : "text-zinc-500"}>
                    {tipoProblema || "Seleccioná el problema..."}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-zinc-500 transition-transform duration-300 ${dropdownProblema ? "rotate-180" : ""}`} />
                </div>

                {/* Lista desplegable flotante */}
                {dropdownProblema && (
                  <div className="absolute z-50 w-full mt-2 bg-[#121214] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                    {[
                      "No hay internet / Wi-Fi",
                      "La compu no enciende",
                      "La compu anda lenta",
                      "La compu tira pantalla azul con una carita triste",
                      "Problema con audio",
                      "Me faltan programas (especificar)",
                      "Problemas con la impresora (especificar)",
                      "Otro tipo de problema"
                    ].map((prob) => (
                      <div
                        key={prob}
                        onClick={() => {
                          setTipoProblema(prob);
                          setDropdownProblema(false); // Cierra el menú al elegir
                        }}
                        className={`p-3.5 cursor-pointer transition-all text-sm border-b border-zinc-800/50 last:border-0 hover:bg-indigo-600/10 hover:text-indigo-300 ${
                          tipoProblema === prob ? "bg-indigo-600/20 text-indigo-400 font-medium" : "text-zinc-300"
                        }`}
                      >
                        {prob}
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
              <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">WhatsApp de contacto (opcional)</label>
          <input
            type="tel"
            value={telefono}
            onChange={(e) => {
              setTelefono(e.target.value);
              if (errorTelefono) setErrorTelefono(false); // Oculta el error ni bien empieza a corregirlo
            }}
            placeholder="Ej: 1123456789"
            className={`w-full bg-[#09090b] border rounded-xl p-3.5 text-zinc-200 placeholder:text-zinc-500 font-sans focus:outline-none transition-all ${
              errorTelefono 
                ? "border-rose-500/70 focus:ring-1 focus:ring-rose-500/70" 
                : "border-zinc-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
            }`}
          />
          {errorTelefono && (
            <p className="text-rose-400 text-sm mt-2 animate-in slide-in-from-top-1">
              El número debe tener 10 dígitos (código de área + número, sin 0 ni 15).
            </p>
          )}
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