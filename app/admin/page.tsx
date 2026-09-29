"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Wrench, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export default function PanelAdmin() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  // Función para traer los tickets
  const fetchTickets = async () => {
    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .order("creado_en", { ascending: false });

    if (error) {
      console.error("Error al traer tickets:", error);
    } else {
      setTickets(data || []);
    }
    setCargando(false);
  };

  // Cargar tickets al iniciar
  useEffect(() => {
    fetchTickets();
  }, []);

  // Función para cambiar el estado a "Resuelto" o volver a "Pendiente"
  const toggleEstado = async (id: string, estadoActual: string) => {
    const nuevoEstado = estadoActual === "Pendiente" ? "Resuelto" : "Pendiente";
    
    // Actualizamos localmente primero (para que sea instantáneo a la vista)
    setTickets(tickets.map(t => t.id === id ? { ...t, estado: nuevoEstado } : t));

    // Actualizamos en la base de datos
    const { error } = await supabase
      .from("tickets")
      .update({ estado: nuevoEstado })
      .eq("id", id);

    if (error) {
      alert("Error al actualizar estado");
      // Revertimos si hay error
      fetchTickets();
    }
  };

  if (cargando) {
    return <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center">Cargando panel...</div>;
  }

  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100 p-4 md:p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-4xl mx-auto">
        
        {/* Cabecera del Panel */}
        <header className="flex flex-col md:flex-row items-center justify-between mb-8 pb-6 border-b border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600/20 text-indigo-400 p-3 rounded-xl border border-indigo-500/30">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Panel de Técnico</h1>
              <p className="text-zinc-500 text-sm">Escuela CJM - Soporte IT</p>
            </div>
          </div>
          <div className="mt-4 md:mt-0 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm flex gap-2">
             Total: <span className="font-bold text-indigo-400">{tickets.length}</span> | 
             Pendientes: <span className="font-bold text-amber-400">{tickets.filter(t => t.estado === "Pendiente").length}</span>
          </div>
        </header>

        {/* Lista de Tickets */}
        {tickets.length === 0 ? (
          <div className="text-center py-20 bg-[#121214] rounded-2xl border border-zinc-800/80">
            <CheckCircle2 className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400 text-lg">No hay tickets pendientes.</p>
            <p className="text-zinc-500 text-sm">¡Todo está funcionando perfecto!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {tickets.map((ticket) => {
              const esPendiente = ticket.estado === "Pendiente";
              
              // Estilos según prioridad
              let prioridadEstilo = "text-zinc-500 bg-zinc-800";
              if (ticket.prioridad === "Alta") prioridadEstilo = "text-rose-400 bg-rose-500/10 border-rose-500/30 border";
              if (ticket.prioridad === "Media") prioridadEstilo = "text-amber-400 bg-amber-500/10 border-amber-500/30 border";
              if (ticket.prioridad === "Baja") prioridadEstilo = "text-emerald-400 bg-emerald-500/10 border-emerald-500/30 border";

              // Estilos según estado
              const cardEstilo = esPendiente 
                ? "bg-[#121214] border-zinc-700 hover:border-indigo-500/50" 
                : "bg-[#09090b] border-zinc-800/50 opacity-60";

              return (
                <article key={ticket.id} className={`p-5 rounded-2xl border transition-all ${cardEstilo} flex flex-col md:flex-row gap-4 items-start md:items-center justify-between`}>
                  
                  {/* Info principal */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded-md ${prioridadEstilo}`}>
                        Prioridad {ticket.prioridad}
                      </span>
                      <span className="text-xs text-zinc-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(ticket.creado_en).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                    
                    <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                      {ticket.ubicacion.replace('_', ' ').toUpperCase()}
                      {ticket.nombre_admin && <span className="text-zinc-400 font-normal text-sm">- {ticket.nombre_admin}</span>}
                    </h2>
                    
                    <p className="text-zinc-300 font-medium mt-1">Falla: {ticket.tipo_problema.replace('_', ' ')}</p>
                    
                    {ticket.detalles && (
                      <p className="text-zinc-500 text-sm mt-2 flex items-start gap-1">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        {ticket.detalles}
                      </p>
                    )}
                  </div>

                  {/* Botón de Acción */}
                  <button
                    onClick={() => toggleEstado(ticket.id, ticket.estado)}
                    className={`mt-4 md:mt-0 w-full md:w-auto px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                      esPendiente 
                        ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20" 
                        : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                    }`}
                  >
                    {esPendiente ? (
                      <>
                        Marcar como Resuelto
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        Resuelto
                      </>
                    )}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}