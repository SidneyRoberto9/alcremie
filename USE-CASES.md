# App

Alcremie style app.

## RFs (Requisitos funcionais)

- [ ] Deve ser possível se cadastrar pelo google;
- [ ] Deve ser possível se autenticar pelo google;
- [ ] Deve ser possível cadastrar uma tag;
- [ ] Deve ser possível buscar as tags;
- [ ] Deve ser possível o usuário editar uma tag;
- [ ] Deve ser possível o usuário deletar uma tag;
- [ ] Deve ser possível buscar as imagens por uma tag;
- [ ] Deve ser possível enviar uma imagem;
- [ ] Deve ser possível buscar as imagens;
- [ ] Deve ser possível obter uma imagem aleatória;
- [ ] Deve ser possível o usuário pode favoritar uma imagem;
- [ ] Deve ser possível o usuário editar uma imagem;
- [ ] Deve ser possível o usuário deletar uma imagem;
- [ ] Deve ser possível obter a estatística de quantidade de imagens;
- [ ] Deve ser possível obter a estatística de quantidade de tags;
- [ ] Deve ser possível obter a estatística de quantidade de requests;

## RNs (Regras de negócio)

- [ ] Editar uma Imagem por administradores;
- [ ] Deletar uma Imagem por administradores;
- [ ] Editar uma Tag por administradores;
- [ ] Deletar uma Tag por administradores;

## RNFs (Requisitos não-funcionais)

- [ ] Os dados da aplicação precisam estar persistidos em um banco MongoDB;
- [ ] Todas listas de dados precisam estar paginadas com no mínimo 1 item e no máximo 25 itens por página;
- [ ] O usuário deve ser identificado por um JWT (JSON Web Token);
