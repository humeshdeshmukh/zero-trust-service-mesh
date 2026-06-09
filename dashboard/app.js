const { useEffect, useMemo, useState } = React;

const accessLinks = [
  {
    name: "Ingress checkout",
    url: "http://billing.local/checkout",
    note: "Public route through the Istio gateway.",
  },
  {
    name: "Ingress admin",
    url: "http://billing.local/admin",
    note: "Expected deny path for the demo.",
  },
  {
    name: "Cluster DNS",
    url: "http://billing.mesh-demo.svc.cluster.local:8080/checkout",
    note: "Direct in-cluster service access.",
  },
  {
    name: "Local port-forward",
    url: "kubectl -n mesh-demo port-forward svc/billing 8080:8080",
    note: "Then open http://127.0.0.1:8080/checkout.",
  },
];

const runbook = [
  {
    title: "Verify authorized traffic",
    description: "Frontend should reach billing on /checkout through the policy stack.",
    command: "kubectl -n mesh-demo exec deploy/frontend -- sh -c 'curl -si http://billing:8080/checkout'",
  },
  {
    title: "Verify denied route",
    description: "The admin path should be denied by Istio authorization.",
    command: "kubectl -n mesh-demo exec deploy/frontend -- sh -c 'curl -si http://billing:8080/admin'",
  },
  {
    title: "Verify rogue isolation",
    description: "The rogue workload should fail or time out when calling billing.",
    command: "kubectl -n mesh-demo exec deploy/rogue -- sh -c 'curl -si --max-time 5 http://billing:8080/checkout || true'",
  },
];

const controls = [
  ["Identity", "SPIRE", "Workload-level SPIFFE identity"],
  ["Transport", "Istio mTLS", "Encrypted east-west traffic"],
  ["Authorization", "Istio policies", "Route-level least privilege"],
  ["Kernel policy", "Cilium L7", "HTTP path and method enforcement"],
  ["PKI", "cert-manager + Vault", "Automated trust material"],
];

function App() {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const uptime = useMemo(() => {
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }, [time]);

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
      'main',
      { className: 'page' },
      React.createElement(
        'section',
        { className: 'hero' },
        React.createElement(
          'article',
          { className: 'hero-card' },
          React.createElement('div', { className: 'eyebrow' }, 'Flagship Operations Dashboard'),
          React.createElement('h1', null, 'Zero-Trust Service Mesh'),
          React.createElement(
            'p',
            { className: 'lede' },
            'A polished control center for the portfolio project: identity, transport security, route authorization, and kernel enforcement all presented as one advanced demo.'
          ),
          React.createElement(
            'div',
            { className: 'hero-actions' },
            React.createElement('a', { className: 'button primary', href: '#access' }, 'Open access links'),
            React.createElement('a', { className: 'button', href: '#runbook' }, 'Run the validation flow'),
            React.createElement('a', { className: 'button', href: '#matrix' }, 'Review the control matrix')
          )
        ),
        React.createElement(
          'div',
          { className: 'side-stack' },
          React.createElement(
            'div',
            { className: 'metric-grid' },
            React.createElement(
              'div',
              { className: 'metric' },
              React.createElement('div', { className: 'label' }, 'Mesh layers'),
              React.createElement('div', { className: 'value' }, '5'),
              React.createElement('div', { className: 'meta' }, 'Identity, transport, authz, kernel policy, and PKI automation.')
            ),
            React.createElement(
              'div',
              { className: 'metric' },
              React.createElement('div', { className: 'label' }, 'Demo state'),
              React.createElement('div', { className: 'value' }, 'Ready'),
              React.createElement('div', { className: 'meta' }, 'The baseline deploy completes even when optional CRDs are absent.')
            ),
            React.createElement(
              'div',
              { className: 'metric' },
              React.createElement('div', { className: 'label' }, 'Direct links'),
              React.createElement('div', { className: 'value' }, '4'),
              React.createElement('div', { className: 'meta' }, 'Ingress, in-cluster service, port-forward, and local dashboard entry points.')
            ),
            React.createElement(
              'div',
              { className: 'metric' },
              React.createElement('div', { className: 'label' }, 'Clock'),
              React.createElement('div', { className: 'value' }, uptime),
              React.createElement('div', { className: 'meta' }, 'Dashboard rendered locally with React and a zero-build runtime.')
            )
          ),
          React.createElement(
            'div',
            { className: 'panel', id: 'access' },
            React.createElement('h2', null, 'Direct access'),
            React.createElement(
              'div',
              { className: 'link-list' },
              accessLinks.map((link) =>
                React.createElement(
                  'a',
                  { key: link.name, className: 'link-card', href: link.url, target: link.url.startsWith('http') ? '_blank' : '_self', rel: 'noreferrer' },
                  React.createElement('div', null, React.createElement('strong', null, link.name), React.createElement('span', null, link.note)),
                  React.createElement('span', null, link.url)
                )
              )
            )
          )
        )
      ),
      React.createElement(
        'section',
        { className: 'layout' },
        React.createElement(
          'div',
          { className: 'section-grid' },
          React.createElement(
            'article',
            { className: 'glass-card panel', id: 'runbook' },
            React.createElement(
              'div',
              { className: 'section-title' },
              React.createElement('div', null, React.createElement('h2', null, 'Validation runbook'), React.createElement('p', null, 'Turn the project into a working interview demo in under a minute.')),
              React.createElement('span', { className: 'status-dot' }, 'Baseline deployed')
            ),
            React.createElement(
              'div',
              { className: 'runbook' },
              runbook.map((step, index) =>
                React.createElement(
                  'div',
                  { className: 'step', key: step.title },
                  React.createElement('div', { className: 'step-number' }, String(index + 1)),
                  React.createElement(
                    'div',
                    null,
                    React.createElement('h3', null, step.title),
                    React.createElement('p', null, step.description),
                    React.createElement('div', { className: 'command' }, step.command)
                  )
                )
              )
            )
          ),
          React.createElement(
            'article',
            { className: 'glass-card panel' },
            React.createElement(
              'div',
              { className: 'section-title' },
              React.createElement('div', null, React.createElement('h2', null, 'Operator shortcuts'), React.createElement('p', null, 'Fast links for proving the platform story live.'))
            ),
            React.createElement(
              'div',
              { className: 'chip-row' },
              React.createElement('span', { className: 'chip' }, 'kubectl -n mesh-demo get pods'),
              React.createElement('span', { className: 'chip' }, 'kubectl -n spire get configmap spire-server-config -o yaml'),
              React.createElement('span', { className: 'chip' }, 'kubectl -n kube-system get configmap clustermesh-hints -o yaml'),
              React.createElement('span', { className: 'chip' }, 'istioctl authn tls-check billing.mesh-demo.svc.cluster.local -n mesh-demo'),
              React.createElement('span', { className: 'chip' }, 'kubectl -n mesh-demo port-forward svc/billing 8080:8080')
            )
          )
        ),
        React.createElement(
          'aside',
          { className: 'section-grid' },
          React.createElement(
            'article',
            { className: 'glass-card panel', id: 'matrix' },
            React.createElement(
              'div',
              { className: 'section-title' },
              React.createElement('div', null, React.createElement('h2', null, 'Control matrix'), React.createElement('p', null, 'What each layer contributes to the overall posture.'))
            ),
            React.createElement(
              'table',
              { className: 'matrix' },
              React.createElement(
                'thead',
                null,
                React.createElement('tr', null, React.createElement('th', null, 'Layer'), React.createElement('th', null, 'Tooling'), React.createElement('th', null, 'Outcome'))
              ),
              React.createElement(
                'tbody',
                null,
                controls.map((row) => React.createElement('tr', { key: row[0] }, React.createElement('td', null, row[0]), React.createElement('td', null, row[1]), React.createElement('td', null, row[2])))
              )
            )
          ),
          React.createElement(
            'article',
            { className: 'glass-card panel' },
            React.createElement(
              'div',
              { className: 'section-title' },
              React.createElement('div', null, React.createElement('h2', null, 'Project positioning'), React.createElement('p', null, 'How to present it as a flagship portfolio piece.'))
            ),
            React.createElement(
              'div',
              { className: 'runbook' },
              React.createElement('div', { className: 'step' }, React.createElement('div', { className: 'step-number' }, 'A'), React.createElement('div', null, React.createElement('h3', null, 'Multi-layer security story'), React.createElement('p', null, 'Shows defense-in-depth from identity all the way to eBPF network policy.'))),
              React.createElement('div', { className: 'step' }, React.createElement('div', { className: 'step-number' }, 'B'), React.createElement('div', null, React.createElement('h3', null, 'Operational polish'), React.createElement('p', null, 'One command bootstrap, graceful best-effort behavior, and a real dashboard.'))),
              React.createElement('div', { className: 'step' }, React.createElement('div', { className: 'step-number' }, 'C'), React.createElement('div', null, React.createElement('h3', null, 'Interview-ready proof'), React.createElement('p', null, 'Direct links, validation commands, and a concise control matrix tell the story fast.')))
            )
          )
        )
      ),
      React.createElement('footer', { className: 'footer' }, React.createElement('div', null, 'Zero-Trust Service Mesh Dashboard'), React.createElement('div', null, 'Served locally by the project bootstrap script.'))
    )
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
