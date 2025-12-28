import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery, gql } from '@apollo/client';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, Bar, BarChart } from 'recharts';
import { Select, DatePicker, Spin, Alert } from 'antd';
import { hasRole } from '../../utils/rbac';

const COST_FACTS_QUERY = gql`
  query CostFacts($tenantId: String, $module: String, $from: String, $to: String) {
    costFacts(tenantId: $tenantId, module: $module, from: $from, to: $to) {
      date
      module
      cost
      forecast
      tenantId
      country
    }
  }
`;
const COST_ALERTS_QUERY = gql`
  query CostAlerts($tenantId: String, $from: String, $to: String) {
    costAlerts(tenantId: $tenantId, from: $from, to: $to) {
      date
      alertType
      message
      cost
      module
    }
  }
`;

export default function CostDashboard() {
  const { data: session } = useSession();
  const [filters, setFilters] = useState({ tenantId: '', country: '', module: '', from: '', to: '' });
  const { data, loading, error } = useQuery(COST_FACTS_QUERY, { variables: filters });
  const { data: alertsData } = useQuery(COST_ALERTS_QUERY, { variables: filters });

  useEffect(() => {
    if (!hasRole(session, 'super-admin')) {
      // Redirect or show RBAC error
    }
  }, [session]);

  if (!hasRole(session, 'super-admin')) {
    return <Alert message="Access denied" type="error" showIcon />;
  }

  if (loading) return <Spin />;
  if (error) return <Alert message={error.message} type="error" showIcon />;

  return (
    <div className="p-8 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Cost Observability Dashboard</h1>
      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Select placeholder="Tenant" onChange={v => setFilters(f => ({ ...f, tenantId: v }))} style={{ width: 120 }} />
        <Select placeholder="Country" onChange={v => setFilters(f => ({ ...f, country: v }))} style={{ width: 120 }} />
        <Select placeholder="Module" onChange={v => setFilters(f => ({ ...f, module: v }))} style={{ width: 120 }} />
        <DatePicker.RangePicker onChange={dates => setFilters(f => ({ ...f, from: dates?.[0]?.format('YYYY-MM-DD'), to: dates?.[1]?.format('YYYY-MM-DD') }))} />
      </div>
      {/* Cost Chart */}
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data?.costFacts || []}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="cost" stroke="#8884d8" name="Actual Cost" />
          <Line type="monotone" dataKey="forecast" stroke="#82ca9d" name="Forecast (EMA)" />
        </LineChart>
      </ResponsiveContainer>
      {/* Per-module Bar Chart */}
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data?.costFacts || []}>
          <XAxis dataKey="module" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="cost" fill="#8884d8" name="Cost" />
        </BarChart>
      </ResponsiveContainer>
      {/* Alerts */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Cost Alerts</h2>
        {(alertsData?.costAlerts || []).map((alert, i) => (
          <Alert key={i} message={alert.message} type="warning" showIcon className="mb-2" />
        ))}
      </div>
    </div>
  );
}
