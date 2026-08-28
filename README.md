# PsiAgenda

Agenda, prontuario eletronico e organizacao para psicologos clinicos.

Stack: **PHP puro (sem framework) + JavaScript vanilla + HTML + CSS** (Tailwind, compilado estaticamente) + MySQL (PDO). Geracao de PDF delegada a um microsservico Python (Flask + WeasyPrint) num VPS separado. Pensado para hospedagem compartilhada (Hostinger), sem processos continuos — tarefas periodicas rodam como endpoints isolados acionados por Cron Jobs externos.

> O projeto comecou em Next.js/TypeScript; foi reescrito nesta stack porque o plano de hospedagem contratado nao inclui Node.js. A versao Next.js completa continua no historico do Git (commit `711fd3e` e anteriores), recuperavel a qualquer momento.

## Estrutura

```
/
├── index.php, .htaccess          # entrada + URLs amigaveis
├── .env                          # config local (nao versionado)
├── composer.json                 # dompdf (nao usado atualmente) + phpmailer
├── app/                          # logica de negocio, sem output HTML
│   ├── config.php, db.php (PDO), auth.php (sessao nativa), icons.php
│   ├── mailer.php, whatsapp.php, session_messaging.php, pdf_client.php
│   ├── validators/                # 1 arquivo por entidade
│   └── services/
│       ├── pdf/                   # builders de HTML -> PDF (via VPS Python)
│       ├── reminder_scheduler.php, adherence_checker.php, retention_checker.php
├── includes/                      # partials de layout (header/footer, session-panel, etc.)
├── pages/                         # 1 arquivo por rota de pagina
├── api/                           # 1 arquivo por endpoint JSON
├── cron/                          # 3 endpoints protegidos por CRON_SECRET
├── migrations/                    # SQL idempotente (IF NOT EXISTS) + run.php
├── assets/
│   ├── css/app.css                 # Tailwind compilado (nunca editar direto)
│   └── js/                         # JS vanilla, um arquivo por tela/widget
├── storage/documents/              # PDFs gerados (bloqueado por .htaccess)
└── build-tools/tailwind/          # ferramenta de build LOCAL do CSS (nao roda no servidor)
```

## Configuracao local (XAMPP)

1. Copie `.env.example` para `.env` e ajuste as credenciais (o `.env` deste checkout ja aponta para o MySQL do XAMPP — `root` sem senha).
2. Garanta que o MySQL do XAMPP esteja rodando.
3. Instale as dependencias PHP (Composer ja fica em `build-tools/composer.phar`):
   ```bash
   php build-tools/composer.phar install
   ```
4. Rode as migrations (cria o banco `psiagenda` e as 11 tabelas, se ainda nao existirem):
   ```bash
   php migrations/run.php
   ```
5. Acesse **http://localhost/PsiAgenda/** (projeto precisa estar em `C:\xampp\htdocs\PsiAgenda`).

### CSS (Tailwind)

O CSS de producao (`assets/css/app.css`) e **gerado**, nunca editado direto. Sempre que uma classe Tailwind nova for usada em algum `.php`/`.js`, recompile:
```bash
cd build-tools/tailwind
npm install   # so na primeira vez
npm run build
```

### E-mail (2FA, recuperacao de senha, confirmacao/lembrete de sessao)

Configure `SMTP_HOST`, `SMTP_USER` e `SMTP_PASSWORD` em `.env` (PHPMailer via SMTP). Sem isso, os e-mails sao so logados (`error_log`, prefixo `[mailer]`) — permite testar o fluxo sem mandar e-mail de verdade.

### WhatsApp (Meta Cloud API)

Mensagens proativas (confirmacao/lembrete) exigem um **Message Template aprovado** no WhatsApp Manager — texto livre e rejeitado pra esse caso. Preencha em `.env`:
```
WHATSAPP_API_TOKEN=              # token permanente de um System User
WHATSAPP_PHONE_NUMBER_ID=        # nao e o numero de telefone, e um ID interno
WHATSAPP_BUSINESS_TEMPLATE_CONFIRMATION=   # nome do template aprovado
WHATSAPP_BUSINESS_TEMPLATE_REMINDER=
```
Cada template precisa de exatamente 4 variaveis no corpo, nesta ordem: nome do paciente, nome do profissional, data, horario.

### Geracao de PDF (VPS Python)

Os PDFs (prontuario, registro de sessao, documentos formais) sao gerados chamando um microsservico Python separado (Flask + WeasyPrint, HTML -> PDF), rodando num VPS proprio atras de Nginx com HTTPS (Let's Encrypt) e um servico systemd (restart automatico). O PHP so monta o HTML e manda via cURL (`app/pdf_client.php`):
```
PDF_API_URL=https://pdf-api.seudominio.com.br/generate-pdf
PDF_API_TOKEN=
```
Setup do lado do VPS (Ubuntu 24.04 + Nginx + certbot + Flask/Gunicorn/WeasyPrint como servico systemd) esta documentado na conversa de deploy — nao repetido aqui porque e infraestrutura, nao codigo do repo.

### Configurar os Cron Jobs

Os tres endpoints abaixo (fora de `/api`, direto em `/cron/`) sao isolados — nenhum processo continuo — e devem ser chamados periodicamente por um Cron Job externo. Protegidos por `CRON_SECRET` (`?token=<valor>` na URL ou header `Authorization: Bearer`):

| Endpoint | O que faz | Frequencia sugerida |
| --- | --- | --- |
| `/cron/reminders` | Envia lembretes (e-mail + WhatsApp) de sessoes confirmadas a 7 dias, 2 dias e 24h de distancia, resolvendo a antecedencia por uma cascata sessao > paciente > padrao do profissional. Idempotente. | Diaria |
| `/cron/adherence` | Compara o intervalo entre as duas ultimas sessoes finalizadas de cada paciente ativo com a frequencia esperada; cria alerta se o desvio for grande (1 pendente por paciente por vez). | Diaria |
| `/cron/retention` | Projeta o prazo de guarda documental (5 anos apos o ultimo registro) de pacientes encerrados; alerta quando faltam <= 90 dias. | Semanal |

Exemplo: `curl -s "https://seudominio.com.br/cron/reminders?token=SEU_CRON_SECRET"`. Resultados aparecem em **Central de alertas** (`/alertas`).

## Deploy (Hostinger, hospedagem compartilhada)

1. **Banco de dados**: crie em hPanel > Bancos de dados MySQL.
2. **Codigo**: hPanel > Site > Avancado > GIT > conectar o repositorio GitHub, branch `main`, diretorio = a pasta do subdominio/dominio (ex.: `public_html/PsiAgenda`). O deploy do hPanel roda `composer install` automaticamente.
3. **`.env`**: crie via SSH (`nano .env` na raiz do projeto) com os mesmos campos do `.env.example`, mas com `APP_URL` apontando pro dominio real e segredos novos (`CRON_SECRET`, etc. — nunca reaproveitar os de dev).
4. **Migrations**: via SSH, `php migrations/run.php`.
5. **Cron Jobs**: hPanel > Site > Avancado > Cron Jobs, um `curl` por endpoint (ver tabela acima).

## Status

Migracao de Next.js/TypeScript para PHP concluida em 6 fases (ver historico de commits para o detalhe de cada uma):

1. **Fundacao**: autenticacao (cadastro, login, 2FA, recuperacao de senha) via sessao nativa do PHP, layout com nav fixa e tema claro/escuro, dashboard.
2. **Pacientes + Agenda**: CRUD de pacientes, agenda dia/semana/mes, painel lateral de sessao, criacao/edicao com numeracao sequencial.
3. **Registro clinico + Reagendamento + Perfil**: registro de sessao (campo duplo), reagendamento vinculado, cancelamento, perfil do paciente em 4 abas.
4. **Documentos**: PDF geral/de sessao (com variante em linguagem acessivel) e documentos formais (laudo/atestado/declaracao/relatorio/parecer), via o microsservico Python.
5. **Comunicacao e automacao**: confirmacao automatica ao confirmar sessao, cascata de antecedencia de lembretes (sessao > paciente > profissional) com WhatsApp + e-mail, botoes de envio manual, 3 endpoints de cron, Central de Alertas.
6. **Configuracoes**: perfil, politica de cobranca por falta, preferencias de lembrete, seguranca (2FA + trocar senha + log de acesso), aparencia (tema).

Todas as fases foram testadas localmente ponta a ponta (fluxos reais, incluindo chamadas de verdade a API de PDF) antes de cada commit, com isolamento entre contas confirmado em cada endpoint novo.
