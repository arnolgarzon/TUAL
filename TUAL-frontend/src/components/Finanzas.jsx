import React from "react";
import { BarChart3 } from "lucide-react";

const Finanzas = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="text-blue-600" />
          Finanzas
        </h1>
        <p className="text-sm text-gray-500">
          Control de ingresos, egresos y balances financieros.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-md border">
        <p className="text-gray-600">
          Aquí podrás visualizar métricas financieras y reportes económicos.
        </p>
      </div>
    </div>
  );
};

export default Finanzas;
