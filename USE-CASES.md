# App

Alcremie style app.

## RFs (Requisitos funcionais)

- [ ] Deve ser possível se cadastrar pelo google;
- [ ] Deve ser possível se autenticar pelo google;
- [x] Deve ser possível cadastrar uma tag;
- [ ] Deve ser possível buscar as tags;
- [ ] Deve ser possível o usuário editar uma tag;
- [ ] Deve ser possível o usuário deletar uma tag;
- [ ] Deve ser possível buscar as imagens por uma tag;
- [x] Deve ser possível enviar uma imagem;
- [ ] Deve ser possível buscar as imagens;
- [ ] Deve ser possível obter uma imagem aleatória;
- [ ] Deve ser possível o usuário pode favoritar uma imagem;
- [ ] Deve ser possível o usuário deletar uma imagem;
- [x] Deve ser possível obter a estatística de quantidade de imagens;
- [x] Deve ser possível obter a estatística de quantidade de tags;
- [x] Deve ser possível obter a estatística de quantidade de requests;

## RNs (Regras de negócio)

- [ ] Editar uma Imagem por administradores;
- [ ] Deletar uma Imagem por administradores;
- [ ] Editar uma Tag por administradores;
- [ ] Deletar uma Tag por administradores;

## RNFs (Requisitos não-funcionais)

- [ ] Cada requisição deve ser salva no banco de dados;
- [ ] Os dados da aplicação precisam estar persistidos em um banco MongoDB;
- [x] Todas listas de dados precisam estar paginadas com no mínimo 1 item e no máximo 25 itens por página;
- [ ] O usuário deve ser identificado por um JWT (JSON Web Token);
