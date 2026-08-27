# PsiAgenda

Agenda, prontuario eletronico e organizacao para psicologos clinicos.

Stack: Next.js (App Router) + TypeScript + Tailwind CSS + MySQL (`mysql2`) + JWT/bcrypt + Nodemailer + `pdf-lib` + `zod` + `next-themes` + `lucide-react`. Pensado para hospedagem compartilhada (Hostinger), sem Docker e sem processos em segundo plano.

## Configuracao local

1. Copie `.env.example` para `.env.local` e ajuste as credenciais (o `.env.local` deste checkout ja aponta para o MySQL padrao do XAMPP — `root` sem senha).
2. Garanta que o MySQL do XAMPP esteja rodando (`C:\xampp\mysql_start.bat` ou pelo XAMPP Control Panel).
3. Rode as migrations (cria o banco `psiagenda` e as 11 tabelas, se ainda nao existirem):

   ```bash
   npm run db:migrate
   ```

4. Suba o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

5. Acesse http://localhost:3000 — a rota raiz redireciona para `/login` ou `/dashboard` conforme a sessao.

### E-mail (2FA e recuperacao de senha)

Configure `SMTP_HOST`, `SMTP_USER` e `SMTP_PASSWORD` em `.env.local` com um e-mail existente (Nodemailer via SMTP, sem servicos pagos). Enquanto o SMTP nao estiver configurado, os codigos de verificacao sao apenas logados no console do servidor (prefixo `[mailer]`) para permitir testes locais.

### WhatsApp (lembretes)

O canal WhatsApp para lembretes esta pronto no codigo (mesmo formato de mensagem e mesmo tratamento de erro que o e-mail), mas **nao integrado** — `WHATSAPP_API_URL`/`WHATSAPP_API_TOKEN` ficam em branco de propostio. Enquanto assim, as mensagens sao so logadas no console (prefixo `[whatsapp]`). Quando integrar um provedor (WhatsApp Business Cloud API, Twilio etc.), basta preencher essas duas variaveis em `.env.local` — nenhum outro codigo precisa mudar.

### Configurar os Cron Jobs (hPanel)

Os tres endpoints abaixo sao isolados (sem processo continuo, como pede o enunciado) e devem ser chamados periodicamente por um Cron Job. Protegidos por `CRON_SECRET` — inclua `?token=<valor de CRON_SECRET>` na URL:

| Endpoint | O que faz | Frequencia sugerida |
| --- | --- | --- |
| `GET /api/cron/reminders` | Envia lembretes (e-mail + WhatsApp) de sessoes confirmadas a 7 dias, 2 dias e 24h de distancia. Idempotente — so cria um lembrete por (sessao, intervalo, canal). | Diaria |
| `GET /api/cron/adherence` | Compara o intervalo entre as duas ultimas sessoes finalizadas de cada paciente ativo com a frequencia esperada (semanal/quinzenal/mensal); cria um alerta se o desvio for grande. So um alerta pendente por paciente por vez. | Diaria |
| `GET /api/cron/retention` | Projeta o prazo de guarda documental (5 anos apos o ultimo registro) de pacientes encerrados e cria um alerta quando faltam 90 dias ou menos. | Semanal |

Exemplo de comando de Cron Job no hPanel: `curl -s "https://seudominio.com.br/api/cron/reminders?token=SEU_CRON_SECRET"`.

Os resultados aparecem na tela **Central de alertas** (`/alertas`), acessivel pelo menu.

## Status

- Etapa 1 concluida: setup do projeto, autenticacao (login, cadastro, 2FA por e-mail, recuperacao de senha) e migration completa das 11 tabelas do banco.
- Etapa 2 concluida: CRUD de pacientes (lista com busca e filtro por status, cadastro e edicao), com registro automatico em `access_logs` a cada visualizacao/criacao/edicao e isolamento dos dados por profissional (`user_id`).
- Etapa 3 concluida: agenda com visualizacao em dia/semana/mes, status expandido (livre, pendente, confirmado, reagendado, cancelado_cobrado, cancelado_sem_cobranca), novo agendamento e painel lateral de detalhe/edicao. Cada sessao recebe numeracao sequencial automatica por paciente (criacao protegida contra condicao de corrida via lock na linha do paciente).
- Etapa 4 concluida: registro de sessao com campo duplo obrigatorio (palavra-chave/resumo curto + relatorio completo, nunca unificados) e referencias teoricas opcionais, em relacao 1:1 com cada sessao. Acessivel pelo painel lateral da agenda ("Registro de sessao"), com tela de detalhe mostrando o contexto (paciente, numero do atendimento, data/hora, modalidade, status); registro so pode ser criado apos a sessao ser confirmada (validado na pagina e na API), e ao salvar volta automaticamente para a agenda.
- Etapa 5 concluida: fluxo de reagendamento (motivo, solicitante, indicacao de cobranca) que sempre cria uma nova sessao vinculada a original via a tabela `reschedules`, nunca um registro solto — a sessao original vira "Reagendado" com link visual para a nova, e a nova mostra o vinculo de volta. Cancelamento tambem exige motivo, com status cobrado/nao cobrado. Pequeno historico de sessoes (numeradas, com status) adicionado na pagina do paciente.
- Etapa 6 concluida: prontuario do paciente estruturado em abas (Dados gerais / Historico medico / Linha do tempo de sessoes / Documentos), na tela de visualizacao somente leitura (`/pacientes/[id]/visualizar`) — separada da tela de edicao, acessivel pelo botao "Visualizar" na listagem.
- Etapa 7 concluida: exportacao em PDF (geral do paciente e de sessao especifica) via `pdf-lib`, com a opcao de gerar tambem uma versao em linguagem acessivel para o paciente como um documento adicional (a versao tecnica original nunca e alterada). PDFs ficam fora de `/public` — so acessiveis pela rota autenticada `/api/documents/[id]/download`, que confere se o paciente pertence ao profissional logado. A aba Documentos do prontuario lista tudo com botao de baixar.
- Etapa 8 concluida: lembretes automaticos, indicador de aderencia ao tratamento e alerta de guarda documental — como pede o enunciado, sao endpoints de API isolados (`/api/cron/reminders`, `/api/cron/adherence`, `/api/cron/retention`) pensados para Cron Jobs do hPanel, nao um processo continuo. Protegidos por `CRON_SECRET` (`?token=` na URL ou header `Authorization: Bearer`). Uma nova tela "Central de alertas" (`/alertas`) lista tudo, com acao de marcar alerta de aderencia como revisado. Ver `### Configurar os Cron Jobs` abaixo para os detalhes de cada um e como agendar no hPanel.

- Etapa 9 concluida: geracao de documentos formais (laudo, atestado, declaracao, relatorio, parecer) a partir do prontuario do paciente (`/pacientes/[id]/documentos/novo`). Cada tipo vem com um modelo inicial de texto (estrutura comum de laudo/parecer psicologico — identificacao, motivo, analise, conclusao) que o profissional edita livremente antes de gerar; trocar o tipo so substitui o modelo se o campo ainda nao foi editado, nunca sobrescreve texto ja escrito. Usa a mesma infraestrutura de armazenamento e download segura da etapa 7.

Todos os 9 itens da lista original estao implementados.

### Ajustes recentes

- Exclusao de documentos gerados (`DELETE /api/documents/[id]`, remove o registro e o arquivo do disco), com botao "Excluir" e confirmacao inline na aba Documentos.
- Novo status de sessao `finalizada`, aplicado automaticamente quando um registro de sessao e salvo pela primeira vez (so a partir de `confirmado` — cancelamentos e reagendamentos nao sao sobrescritos se o registro for editado depois). A linha do tempo de sessoes do paciente agora linka direto para a tela de registro quando a sessao esta finalizada, em vez de passar pela agenda.
- Tela de **Configuracoes** (`/configuracoes`): perfil do profissional, politica de cobranca por falta, seguranca (toggle de 2FA + log de acesso recente) e — o pedido principal — **preferencias de lembretes de verdade**: escolha quais dos 3 intervalos usar (7 dias / 2 dias / 24h, marque quantos quiser) e por quais canais (e-mail e/ou WhatsApp, pelo menos um obrigatorio). O `/api/cron/reminders` agora le essas preferencias por profissional em vez do padrao fixo anterior (todos os intervalos, so e-mail) — testei duas contas com preferencias diferentes rodando no mesmo cron e cada uma recebeu exatamente o que configurou.
- **Reformulacao visual e de UX** (pedido grande, feito em uma rodada so):
  - **Modo claro/escuro** de verdade, configuravel em Configuracoes > Aparencia (Claro / Escuro / Sistema), via `next-themes` (Tailwind v4 com `@custom-variant dark`). A preferencia e salva no banco (`users.theme_preference`) e usada como padrao num navegador novo; a partir do primeiro clique, `localStorage` assume (sem flash de tema errado). Testei: alternar tema muda a classe `dark` no `<html>`, a cor de fundo muda de verdade, e persiste no banco.
  - **Cabecalho fixo** (`sticky top-0`) com navegacao destacando a pagina ativa (sublinhado animado) e um pouco de blur no fundo.
  - **Icones no lugar de texto**: lapis para editar, lixeira vermelha para excluir (`lucide-react`), com **confirmacao em modal antes de qualquer exclusao** (padronizado num componente `ConfirmDialog`/`DeleteIconButton` reutilizado em sessoes e documentos — antes cada tela tinha sua propria confirmacao "solta").
  - **Trocar senha** em Configuracoes > Seguranca (exige senha atual).
  - **Dashboard com conteudo de verdade**: sessoes de hoje, contagem de alertas ativos, atalhos rapidos — antes era so uma tela de boas-vindas.
  - Passo de polimento (transicoes, hover com leve elevacao, animacoes de entrada) em praticamente todas as telas, junto com o dark mode.

### Controle granular de confirmacao e lembretes

Antes, "enviar lembrete" era uma preferencia global do profissional, sem jeito de desligar para um paciente ou sessao especifica, sem mensagem de confirmacao de verdade, e sem botao pra disparar na hora. Agora:

- **Confirmacao de sessao**: mensagem enviada automaticamente no instante em que uma sessao passa para o status "confirmado" (evento, nao agendamento — nao tem "antecedencia"). Disparo e idempotente (`sessions.confirmation_sent_at`, so envia uma vez por sessao mesmo que ela seja salva de novo com o mesmo status). Pode ser desligada por paciente (cadastro/edicao do paciente) ou por sessao (painel da agenda), e reenviada manualmente a qualquer momento com o botao "Enviar confirmacao agora".
- **Lembretes com antecedencia em cascata de 3 niveis**: sessao > paciente > padrao global do profissional (Configuracoes > Preferencias de lembretes). Cada nivel pode dizer "usar padrao" (herda do nivel acima), "sempre enviar" ou "nunca enviar" para cada uma das 3 antecedencias (7 dias / 2 dias / 24h) — testado com paciente bloqueando 7 dias globalmente (nao dispara mesmo com o padrao do profissional ligado) e uma sessao especifica religando so para ela (override de sessao vence o de paciente). Tambem tem botao "Enviar lembrete agora", que grava um registro com `interval_type = 'manual'` em `/alertas`.
- Liga/desliga por paciente (`patients.reminders_enabled`) continua existindo como interruptor geral, acima de tudo isso.
- **Botao "Ver perfil do paciente"** (icone de olho) adicionado em todo lugar do site que mostra informacao de um paciente sem já estar na tela de perfil dele: dashboard, central de alertas, listas da agenda (dia/semana), painel lateral de sessao, registro de sessao, tela de edicao do paciente e criacao de documento formal — sempre linkando pra `/pacientes/[id]/visualizar`.

### Bugs corrigidos nesta rodada

- Um documento gerado sem versao acessivel mostrava um "0" solto ao lado do nome do tipo na lista — `documents.patient_readable_version` vem do MySQL como `0`/`1` (nao `false`/`true`), e `{0 && <span>...</span>}` faz o React renderizar o `0` literal em vez de nada. Corrigido com `Boolean(...)` antes do `&&`.
- O painel lateral de detalhe de sessao ficava cortado (nao ocupava a tela toda) nas visoes dia/semana: a causa era a classe `animate-fade-in-up` de um elemento ancestral deixando um `transform` residual, o que faz o navegador tratar `position: fixed` como relativo a esse ancestral em vez da viewport. O painel agora e renderizado fora do wrapper animado.
- `sessions.scheduled_at` e `verification_codes.expires_at` eram a primeira coluna `TIMESTAMP NOT NULL` sem `DEFAULT` explicito de suas tabelas — comportamento legado do MySQL/MariaDB fazia essas colunas serem sobrescritas com a hora atual em **qualquer** `UPDATE` na linha, mesmo um que nunca tocasse nelas (foi assim que o fluxo de reagendamento corrompia o horario original da sessao ao mudar so o status). Corrigido dando a cada coluna seu proprio `DEFAULT CURRENT_TIMESTAMP` explicito (migration `003`).
