# Documentação de Telas e Fluxos — Emprego Perto de Você

---

## **Listas Fechadas Oficiais do Sistema (Domínios / Enums)**

- **Perfis de Usuário:** `Candidato`, `Empresa`
- **Áreas de Atuação (Categorias):** `Alimentação`, `Comércio`, `Saúde`, `Serviços Gerais`, `Educação`
- **Tipos de Contrato:** `CLT`, `Meio Período`, `Temporário`, `Estágio`
- **Regimes de Trabalho:** `Presencial`, `Híbrido`, `Remoto`
- **Turnos de Trabalho:** `Integral`, `Manhã`, `Tarde`, `Noturno`
- **Status da Vaga:** `Aberta`, `Pausada`, `Encerrada`, `Cancelada`
- **Status da Candidatura:** `Enviada`, `Em análise`, `Currículo visto`, `Entrevista`, `Encerrada`, `Rejeitada`
- **Agrupamento de Status da Candidatura (apenas para filtro do candidato):**
    - `Em andamento` = `Enviada`, `Em análise`, `Currículo visto`, `Entrevista`
    - `Encerradas` = `Encerrada`, `Rejeitada`

## 1. Ponto de Partida: Autenticação e Seleção de Perfil

- **Autenticação / Login**
    
    **O que faz:** Permite acessar a conta ou alternar para a aba de cadastro, selecionando previamente o tipo de perfil (Candidato ou Empresa) apenas na criação de conta.
    
    - **Entradas (Campos/Ações):**
        - Seletor de Perfil (Candidato ou Empresa) - **exibido e válido apenas na aba “Criar conta”**
        - Campo de E-mail: Obrigatório (formato de e-mail válido)
        - Campo de Senha: Obrigatório
        - Botão de Ação (Entrar)
        - Botão / Aba (Criar conta)
        - **Destino de Navegação:**
            - Clique em "Entrar": Valida credenciais e redireciona para `Candidato / MapaInicial` (se candidato) ou `Empresa / Painel` (se empresa).
            - Clique em "Criar conta": Exige a seleção do perfil e redireciona para a tela de formulário de cadastro correspondente (`Autenticação / CadastroCandidato` ou `Autenticação / CadastroEmpresa`).
    - **Saídas (Exibição):** Título "Vagas perto de onde você mora", abas de navegação (Entrar / Criar conta) e aviso de privacidade sobre a região aproximada.
    - **Estados da Tela:**
        - *Carregando:* Botão "Entrar" desabilitado com indicador de carregamento (*spinner*) durante a autenticação.
        - *Erro (Campo Inválido):* Mensagem sob o campo: *"Informe um e-mail válido."* / *"Informe sua senha."*
        - *Erro (Login Inválido):* Alerta visual em vermelho ou toast: *"E-mail ou senha inválidos. Tente novamente."*

## 2. Telas do Fluxo do Candidato

- **Autenticação / CadastroCandidato**
    
    **O que faz:** Realiza o cadastro inicial do candidato no sistema com seus dados, área de interesse e localização aproximada.
    
    - **Entradas (Campos/Ações):**
        - **Nome Completo:** Obrigatório (mín. 3 caracteres)
        - **E-mail:** Obrigatório (formato de e-mail válido)
        - **Telefone:** Obrigatório (com DDD)
        - **WhatsApp:** Opcional (com DDD, se preenchido)
        - **Área de Interesse:** Obrigatório (lista fechada de Áreas de Atuação)
        - **Cidade:** Obrigatório (seleção em lista)
        - **Bairro:** Obrigatório (seleção em lista, carregada conforme a Cidade escolhida)
        - **Senha:** Obrigatório (mín. 8 caracteres)
        - **Confirmação de Senha:** Obrigatório (deve ser idêntica à Senha)
        - Botão Cadastrar.
        - **Destino de Navegação:**
            - Clique em "Cadastrar": Efetua o cadastro na API e redireciona automaticamente para `Candidato / MapaInicial`.
            - Clique em "Já tem uma conta? Entrar": Retorna para `Autenticação / Login`.
    - **Saídas (Exibição):** Título "Cadastro de Candidato", ilustração visual, indicador de privacidade de dados e formulário.
    - **Estados da Tela:**
        - *Carregando:* Botão "Cadastrar" desabilitado em modo de processamento.
        - *Erro (Validação):* Destaque nos campos com problema (ex: *"Informe um e-mail válido."*, *"A senha deve ter no mínimo 8 caracteres."*, *"As senhas não coincidem."*).
        - *Erro (E-mail existente):* *"Este e-mail já está em uso."*
- **Candidato / MapaInicial**
    
    **O que faz:** Exibe o mapa com as vagas da região e permite a navegação por busca e categorias.
    
    - **Entradas (Campos/Ações):**
        - Campo de busca ("Buscar vagas, empresas ou área...")
        - Ícone de alvo/mira (localização no mapa)
        - Ícone de filtros avançados
        - Seletores de categorias (Todas, Alimentação, Comércio, Saúde, Serviços Gerais, Educação)
        - Card flutuante da empresa com botão "Ver vagas e detalhes"
        - **Destino de Navegação:**
            - Clique no botão "Ver vagas e detalhes": Redireciona para a tela `Candidato / DetalhesEmpresa` com os dados da empresa selecionada.
            - Clique no ícone de filtros: Abre a modal sobreposta `Candidato / ModalFiltros`.
    - **Saídas (Exibição):** Mapa interativo com marcadores de vagas, detalhes resumidos no card flutuante e barra inferior de navegação (**Mapa**, **Candidaturas**, **Perfil**).
    - **Estados da Tela:**
        - *Carregando:* Carregamento visual (*skeleton*) no card flutuante e no mapa durante a busca por geolocalização.
        - *Sem Resultados:* Alerta flutuante no topo do mapa: *"Nenhuma vaga encontrada nesta região ou busca."*
        - *Permissão de Localização Negada:* Modal/Banner informando que o acesso ao GPS foi negado. O mapa assume por padrão o centro da cidade/bairro cadastrado no perfil.
- **Candidato / ModalFiltros**
    
    **O que faz:** Filtra as vagas do mapa por critérios específicos.
    
    - **Entradas (Campos/Ações):**
        - Seletor Vagas / Empresas, opções de área (lista fechada de Áreas de Atuação), slider de distância aproximada (500m a 10 km), tipo de contrato (lista fechada de Tipos de Contrato).
        - Botão "Mostrar X vagas" e botão "Limpar".
        - Todos os filtros são opcionais.
        - **Destino de Navegação:**
            - Clique em "Mostrar X vagas": Aplica os filtros, fecha a modal e atualiza os marcadores na `Candidato / MapaInicial`.
    - **Saídas (Exibição):** Modal sobreposta com os seletores e contagem dinâmica de resultados.
    - **Estados da Tela:**
        - *Sem Resultados (Contagem 0):* O botão exibe *"Nenhuma vaga encontrada"* e fica desabilitado para clique até que os filtros sejam alterados.
- **Candidato / DetalhesEmpresa**
    
    **O que faz:** Detalha as informações institucionais da empresa e exibe a lista resumida de vagas abertas.
    
    - **Entradas (Campos/Ações):**
        - Botão de retorno (←)
        - Card/Item da lista de vagas
        - **Destino de Navegação:**
            - Clique em uma Vaga da Lista: Redireciona para a tela `Candidato / DetalhesVaga` enviando o ID da vaga escolhida.
            - Clique no botão de retorno (←): Volta para `Candidato / MapaInicial`.
    - **Saídas (Exibição):** Nome da empresa, setor (informado em `Autenticação / CadastroEmpresa`), bairro, distância aproximada em km, contatos (telefone e site, este último exibido apenas se preenchido no cadastro), descrição da empresa (exibida apenas se preenchida) e listagem de vagas abertas.
    - **Estados da Tela:**
        - *Carregando:* Carregamento em esqueleto (*skeleton screen*) dos dados e vagas da empresa.
        - *Sem Vagas Abertas:* Mensagem explicativa: *"Esta empresa não possui vagas abertas no momento."*
- **Candidato / DetalhesVaga**
    
    **O que faz:** Exibe a descrição completa, requisitos e detalhes específicos de uma vaga selecionada antes do envio da candidatura.
    
    - **Entradas (Campos/Ações):**
        - Botão de retorno (←)
        - Botão principal "Candidatar-me a esta vaga"
        - **Destino de Navegação:**
            - Clique em "Candidatar-me a esta vaga": Registra a candidatura na API com status `Enviada`, altera o botão para "Candidatura Enviada" e habilita o atalho para visualizar em `Candidato / MinhasCandidaturas`.
            - Clique no botão de retorno (←): Volta para `Candidato / DetalhesEmpresa`.
    - **Saídas (Exibição):** Título do cargo, nome da empresa, bairro, regime de trabalho, turno, tipo de contrato, salário/remuneração (informado em `Empresa / CriarVaga`; se não preenchido, exibe *"A combinar"*), Descrição da Vaga, Requisitos e status atual da candidatura (que aparece quando o candidato abre ou atualiza a tela).
    - **Estados da Tela:**
        - *Carregando:* Indicador visual de carregamento das informações completas da vaga.
        - *Candidatura Repetida (Já Candidatado):* O botão fica desabilitado exibindo *"Candidatura Enviada"* juntamente com o selo do status atual (ex: *Em análise*), evitando cadastros duplicados.
- **Candidato / MinhasCandidaturas**
    
    **O que faz:** Lista todas as candidaturas enviadas pelo usuário para acompanhamento de status.
    
    - **Entradas (Campos/Ações):**
        - Filtros de status: `Todas`, `Em andamento` (Enviada, Em análise, Currículo visto, Entrevista) e `Encerradas` (Encerrada, Rejeitada)
        - Clique em uma candidatura da lista
        - **Destino de Navegação:**
            - Clique em um card de candidatura: Redireciona para `Candidato / DetalhesVaga` para rever as informações daquela vaga.
    - **Saídas (Exibição):** Indicador do total de candidaturas acompanhadas e cards das vagas contendo título, empresa, bairro, data e selo de status (exibindo o status individual: `Enviada`, `Em análise`, `Currículo visto`, `Entrevista`, `Encerrada` ou `Rejeitada`). O status atualizado pela empresa aparece quando o candidato abre ou atualiza a tela.
    - **Estados da Tela:**
        - *Carregando:* Carregamento dos cards de candidaturas.
        - *Sem Resultados / Vazio:* Ilustração acompanhada da mensagem: *"Você ainda não se candidatou a nenhuma vaga. Explore o mapa!"*
- **Candidato / Perfil**
    
    **O que faz:** Exibe as informações do perfil do usuário e a gestão do currículo anexado.
    
    - **Entradas (Campos/Ações):**
        - Botão "Substituir PDF" / "Enviar PDF" (Opcional; apenas arquivos em formato PDF, tamanho máximo de 5 MB)
        - **Destino de Navegação:**
            - Clique em "Enviar/Substituir PDF": Abre o seletor de arquivos local do dispositivo para upload do documento.
    - **Saídas (Exibição):** Dados pessoais, e-mail, telefone, área de interesse, região cadastrada (cidade e bairro) e nome do arquivo PDF anexado com data de envio.
    - **Estados da Tela:**
        - *Carregando Upload:* Barra/indicador de progresso do envio do arquivo PDF.
        - *Erro no Upload:* Mensagem de erro em caso de arquivo inválido ou excedendo o limite de tamanho (> 5 MB).

## 3. Telas do Fluxo da Empresa

- **Autenticação / CadastroEmpresa**
    
    **O que faz:** Realiza o cadastro do perfil corporativo da empresa no sistema.
    
    - **Entradas (Campos/Ações):**
        - **Nome da Empresa:** Obrigatório (mín. 3 caracteres)
        - **CNPJ:** Obrigatório (14 dígitos, com dígitos verificadores válidos)
        - **E-mail Corporativo:** Obrigatório (formato de e-mail válido)
        - **Senha:** Obrigatório (mín. 8 caracteres)
        - **Confirmação de Senha:** Obrigatório (deve ser idêntica à Senha)
        - **Telefone / WhatsApp:** Obrigatório (com DDD)
        - **Descrição:** Opcional (texto livre)
        - **Setor:** Obrigatório (lista fechada de Áreas de Atuação)
        - **Site:** Opcional (URL válida, se preenchido)
        - **Cidade:** Obrigatório (seleção em lista)
        - **Bairro:** Obrigatório (seleção em lista, carregada conforme a Cidade escolhida)
        - Botão Cadastrar Empresa.
        - **Destino de Navegação:**
            - Clique em "Cadastrar Empresa": Cria a conta empresarial na API e redireciona diretamente para `Empresa / Painel`.
            - Clique em "Já tem uma conta? Entrar": Retorna para `Autenticação / Login`.
    - **Saídas (Exibição):** Formulário de dados operacionais e links para termos de uso e privacidade.
    - **Estados da Tela:**
        - *Carregando:* Processamento do botão de envio.
        - *Erro (Validação):* Destaque nos campos com problema (ex: *"CNPJ inválido."*, *"Informe um e-mail válido."*, *"A senha deve ter no mínimo 8 caracteres."*, *"Informe uma URL válida."*).
        - *Erro (CNPJ/E-mail em uso):* Mensagem: *"CNPJ ou E-mail corporativo já cadastrado."*
- **Empresa / Painel** *(Aba **Vagas** da Barra Inferior)*
    
    **O que faz:** Painel central da empresa para visualização de métricas e acompanhamento de vagas ativas.
    
    - **Entradas (Campos/Ações):**
        - Botão "+ Publicar nova vaga"
        - Clique em uma vaga existente na lista
        - **Destino de Navegação:**
            - Clique em "+ Publicar nova vaga": Redireciona para o formulário `Empresa / CriarVaga`.
            - Clique em uma Vaga existente: Redireciona para `Empresa / EditarVaga` carregando os dados da vaga.
    - **Saídas (Exibição):** Indicadores no topo (Vagas abertas, Candidaturas), lista "Minhas Vagas" (com selo de status da vaga: `Aberta`, `Pausada`, `Encerrada` ou `Cancelada`) e barra inferior de navegação da empresa (**Vagas**, **Candidatos**).
    - **Estados da Tela:**
        - *Carregando:* Carregamento das métricas e lista de vagas.
        - *Sem Vagas Cadastradas:* Exibição da mensagem: *"Sua empresa ainda não publicou nenhuma vaga. Clique em '+ Publicar nova vaga' para começar."*
- **Empresa / Candidatos** *(Aba **Candidatos** da Barra Inferior — Tela Adicionada)*
    
    **O que faz:** Lista completa de todos os candidatos inscritos nas vagas da empresa, permitindo a triagem e alteração do status das candidaturas no processo seletivo.
    
    - **Entradas (Campos/Ações):**
        - Filtro por Vaga e Filtro por Status da Candidatura (`Enviada`, `Em análise`, `Currículo visto`, `Entrevista`, `Encerrada`, `Rejeitada`)
        - **Seletor de Status da Candidatura (Dropdown em cada card do candidato)**
        - Botão "Ver PDF" do currículo
        - **Destino de Navegação:**
            - Clique no Seletor de Status: Altera o status da candidatura no servidor. A mudança **aparece quando o candidato abre ou atualiza a tela** no aplicativo dele (sem tempo real no MVP), exibindo um dos status: Enviada, Em análise, Currículo visto, Entrevista, Encerrada ou Rejeitada.
            - Clique no botão "Ver PDF": Abre o visualizador de PDF do navegador/dispositivo com o arquivo de currículo enviado pelo candidato (botão desabilitado se o candidato não enviou currículo).
    - **Saídas (Exibição):** Lista de cards com nome do candidato, cargo pretendido, bairro, data da candidatura, atalho para o PDF, seletor de status ativo e barra inferior de navegação (**Vagas**, **Candidatos**).
    - **Estados da Tela:**
        - *Carregando:* Animação de carregamento no seletor durante a atualização do status via API.
        - *Sem Candidatos:* Mensagem: *"Nenhum candidato inscrito para os filtros selecionados."*
- **Empresa / CriarVaga**
    
    **O que faz:** Formulário para criar e publicar um novo anúncio de vaga de emprego no sistema.
    
    - **Entradas (Campos/Ações):**
        - **Título:** Obrigatório (mín. 5 caracteres)
        - **Descrição:** Obrigatório (mín. 20 caracteres)
        - **Requisitos:** Obrigatório (texto livre)
        - **Área:** Obrigatório (lista fechada de Áreas de Atuação)
        - **Contrato:** Obrigatório (lista fechada de Tipos de Contrato)
        - **Regime:** Obrigatório (lista fechada de Regimes de Trabalho)
        - **Turno:** Obrigatório (lista fechada de Turnos de Trabalho)
        - **Cidade:** Obrigatório (seleção em lista)
        - **Bairro:** Obrigatório (seleção em lista, carregada conforme a Cidade escolhida)
        - **Salário:** Opcional (valor numérico em R$, maior que zero; se vazio, a vaga exibe "A combinar")
        - Botão Publicar Vaga.
        - **Destino de Navegação:**
            - Clique em "Publicar Vaga": Salva a vaga via API com status `Aberta` e redireciona de volta para a `Empresa / Painel`.
    - **Saídas (Exibição):** Formulário de publicação de vaga.
    - **Estados da Tela:**
        - *Carregando:* Botão "Publicar Vaga" desabilitado durante o envio.
        - *Erro:* Alerta sob campos obrigatórios não preenchidos ou inválidos (ex: *"Campo obrigatório."*, *"Informe um valor de salário válido."*).
- **Empresa / EditarVaga**
    
    **O que faz:** Permite à empresa editar as informações de uma vaga já cadastrada ou alterar o seu status.
    
    - **Entradas (Campos/Ações):**
        - Dados da vaga (mesmos campos e validações de `Empresa / CriarVaga`).
        - **Seletor de Status da Vaga:** Obrigatório (`Aberta`, `Pausada`, `Encerrada`, `Cancelada`).
        - Botão Salvar Alterações.
        - **Destino de Navegação:**
            - Clique em "Salvar Alterações": Atualiza os dados no servidor e retorna para a `Empresa / Painel`.
    - **Saídas (Exibição):** Formulário pré-preenchido com os dados atuais da vaga.
    - **Estados da Tela:**
        - *Carregando:* Processamento de atualização dos dados.
        - *Erro:* Alerta sob campos obrigatórios não preenchidos ou inválidos.