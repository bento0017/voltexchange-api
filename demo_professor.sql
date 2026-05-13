

-- Passo 1: Ver estado do contador 1 antes
SELECT contadorid, numeroserie, estado
FROM contadores
WHERE contadorid = 1;
-- ESPERADO: estado = 'ATIVO' (ou 'MANUTENCAO' se ja testado antes)

-- Passo 2: Inserir leitura NORMAL (temperatura = 25, sem erro)
INSERT INTO leituras (contadorid, datahora, kwh_leitura, dadosaudit)
VALUES (2, NOW(), 5.5, '{"temperatura": 25, "erro_codigo": null}');

-- Passo 3: Verificar que contador 2 NAO mudou (temperatura < 80)
SELECT contadorid, estado FROM contadores WHERE contadorid = 2;
-- ESPERADO: estado continua 'ATIVO'

-- Passo 4: Inserir leitura ANOMALA (temperatura = 85)
INSERT INTO leituras (contadorid, datahora, kwh_leitura, dadosaudit)
VALUES (3, NOW(), 5.5, '{"temperatura": 85, "erro_codigo": null}');

-- Passo 5: Verificar que contador 3 mudou para MANUTENCAO
SELECT contadorid, estado FROM contadores WHERE contadorid = 3;
-- ESPERADO: estado = 'MANUTENCAO'

-- Passo 6: Inserir leitura ANOMALA (com erro_codigo)
INSERT INTO leituras (contadorid, datahora, kwh_leitura, dadosaudit)
VALUES (4, NOW(), 5.5, '{"temperatura": 30, "erro_codigo": "E03"}');

-- Passo 7: Verificar que contador 4 mudou para MANUTENCAO
SELECT contadorid, estado FROM contadores WHERE contadorid = 4;
-- ESPERADO: estado = 'MANUTENCAO'


-- ============================================================
-- DEMONSTRACAO 2: sp_ExecutarCompraDireta (ACID)
-- ============================================================

-- Passo 8: Ver saldos antes da compra
SELECT utilizadorid, nome, saldo FROM utilizadores WHERE utilizadorid IN (1, 2);

-- Passo 9: Ver ofertas ATIVAS (escolher uma para comprar)
SELECT ofertaid, vendedorid, quantidadekwh, precounitario, estado
FROM ofertasvenda
WHERE estado = 'ATIVA'
LIMIT 5;

-- Passo 10: Executar compra direta (substituir XX pelo ofertaid real)
-- CALL sp_ExecutarCompraDireta(XX, 2);

-- Passo 11: Ver saldos DEPOIS da compra
SELECT utilizadorid, nome, saldo FROM utilizadores WHERE utilizadorid IN (1, 2);
-- ESPERADO: comprador debitado, vendedor creditado

-- Passo 12: Verificar oferta passou para VENDIDA
SELECT ofertaid, estado FROM ofertasvenda WHERE ofertaid = XX;
-- ESPERADO: estado = 'VENDIDA'

-- Passo 13: Verificar transacao criada
SELECT * FROM transacoes ORDER BY datatransacao DESC LIMIT 1;


-- ============================================================
-- DEMONSTRACAO 3: sp_MatchingEngine (Matching Automático)
-- ============================================================

-- Passo 14: Criar nova oferta ATIVA
INSERT INTO ofertasvenda (vendedorid, quantidadekwh, precounitario, estado)
VALUES (1, 50, 0.10, 'ATIVA');

-- Passo 15: Criar ordem PENDENTE
INSERT INTO ordenscompra (compradorid, quantidadekwh, precomaximo)
VALUES (2, 50, 0.15);

-- Passo 16: Ver ordens e ofertas ANTES do matching
SELECT * FROM ordenscompra WHERE estado = 'PENDENTE' ORDER BY ordemid DESC LIMIT 1;
SELECT * FROM ofertasvenda WHERE estado = 'ATIVA' ORDER BY ofertaid DESC LIMIT 1;

-- Passo 17: Executar matching
CALL sp_MatchingEngine();

-- Passo 18: Verificar que ordem passou para CONCLUIDA
SELECT ordemid, estado FROM ordenscompra ORDER BY ordemid DESC LIMIT 1;
-- ESPERADO: estado = 'CONCLUIDA'

-- Passo 19: Verificar que oferta passou para VENDIDA
SELECT ofertaid, estado FROM ofertasvenda ORDER BY ofertaid DESC LIMIT 1;
-- ESPERADO: estado = 'VENDIDA'

-- Passo 20: Verificar transacao de matching criada
SELECT * FROM transacoes ORDER BY datatransacao DESC LIMIT 1;


-- ============================================================
-- DEMONSTRACAO 4: Trigger 2 - Protecao Financeira
-- ============================================================

-- Passo 21: Tentar apagar utilizador com saldo positivo
-- ESPERADO: ERRO - 'ERRO : utilizador tem saldo superior a 0'
DELETE FROM utilizadores WHERE utilizadorid = 101;

-- Passo 22: Tentar apagar utilizador com ofertas ATIVAS
-- ESPERADO: ERRO - 'ERRO : o utilizador tem vendas registadas em estado ATIVA'
DELETE FROM utilizadores WHERE utilizadorid = 1;
