export default function LdpPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">LDP Management</h1>
      <ul className="list-disc pl-4">
        <li>
          <a href="/panel/ldp/users">Users</a>
        </li>
        <li>
          <a href="/panel/ldp/services">Services</a>
        </li>
        <li>
          <a href="/panel/ldp/config">Configuration</a>
        </li>
        <li>
          <a href="/panel/ldp/status">Status</a>
        </li>
        <li>
          <a href="/panel/ldp/consent">Login/Consent</a>
        </li>
      </ul>
    </div>
  );
}
