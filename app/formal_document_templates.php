<?php
declare(strict_types=1);

const FORMAL_DOCUMENT_TEMPLATES = [
    'atestado' => "Atesto, para os devidos fins, que [PACIENTE] esteve sob meus cuidados profissionais em atendimento psicologico na data de [DATA], necessitando de afastamento de suas atividades [laborais/escolares] por [X dias], a partir desta data, por motivos de saude.",

    'declaracao' => "Declaro, para os devidos fins que se fizerem necessarios, que [PACIENTE] encontra-se em acompanhamento psicologico sob minha responsabilidade profissional desde [DATA], com frequencia [semanal/quinzenal/mensal].",

    'laudo' => "1. IDENTIFICACAO\n[Paciente], em acompanhamento psicologico desde [data].\n\n2. MOTIVO DO ENCAMINHAMENTO\n[Descreva o motivo que originou a avaliacao ou o encaminhamento.]\n\n3. PROCEDIMENTOS UTILIZADOS\n[Descreva as tecnicas, instrumentos ou entrevistas utilizadas.]\n\n4. ANALISE\n[Apresente a analise das informacoes coletadas.]\n\n5. CONCLUSAO\n[Apresente a conclusao e, se aplicavel, encaminhamentos.]",

    'relatorio' => "1. IDENTIFICACAO DO PACIENTE\n[Paciente], em acompanhamento desde [data].\n\n2. PERIODO DO ACOMPANHAMENTO\n[Descreva o periodo e a frequencia dos atendimentos.]\n\n3. EVOLUCAO CLINICA\n[Descreva a evolucao observada ao longo do acompanhamento.]\n\n4. CONSIDERACOES FINAIS\n[Apresente as consideracoes finais e recomendacoes, se houver.]",

    'parecer' => "1. SOLICITACAO\n[Descreva a questao ou solicitacao que motivou este parecer.]\n\n2. METODOLOGIA\n[Descreva os procedimentos utilizados para a analise.]\n\n3. ANALISE\n[Apresente a analise tecnica da questao apresentada.]\n\n4. PARECER\n[Apresente a conclusao e o parecer profissional.]",
];
