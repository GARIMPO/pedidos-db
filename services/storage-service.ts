import type { Pedido } from "@/types/pedido"
import type { Transacao } from "@/types/financas"
import type { Contato } from "@/types/contato"

// Nome do banco de dados IndexedDB
const DB_NAME = 'pedidos-app-db';
const DB_VERSION = 1;

// Stores no IndexedDB
const STORES = {
  PEDIDOS: "pedidos",
  TRANSACOES: "transacoes",
  CONTATOS: "contatos",
  APP_VERSION: "app_version",
}

// Versão atual do app para controle de migrações futuras
const CURRENT_APP_VERSION = "1.0.0"

// Inicializa o banco de dados
let dbPromise: Promise<IDBDatabase> | null = null;

const initDatabase = (): Promise<IDBDatabase> => {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      console.error("Seu navegador não suporta IndexedDB");
      reject("IndexedDB não suportado");
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("Erro ao abrir o banco de dados:", event);
      reject("Erro ao abrir o banco de dados");
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Criar stores se não existirem
      if (!db.objectStoreNames.contains(STORES.PEDIDOS)) {
        db.createObjectStore(STORES.PEDIDOS, { keyPath: "id" });
      }
      
      if (!db.objectStoreNames.contains(STORES.TRANSACOES)) {
        db.createObjectStore(STORES.TRANSACOES, { keyPath: "id" });
      }
      
      if (!db.objectStoreNames.contains(STORES.CONTATOS)) {
        db.createObjectStore(STORES.CONTATOS, { keyPath: "id" });
      }
      
      if (!db.objectStoreNames.contains(STORES.APP_VERSION)) {
        db.createObjectStore(STORES.APP_VERSION, { keyPath: "id" });
      }
    };
  });

  return dbPromise;
};

// Função para salvar dados no IndexedDB
const saveData = async <T>(storeName: string, data: T[]): Promise<void> => {
  try {
    const db = await initDatabase();
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    
    // Limpar store antes de inserir novos dados
    store.clear();
    
    // Adicionar cada item individualmente
    data.forEach(item => {
      store.add(item);
    });
    
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = (event) => {
        console.error(`Erro ao salvar dados (${storeName}):`, event);
        reject(event);
      };
    });
  } catch (error) {
    console.error(`Erro ao salvar dados (${storeName}):`, error);
    
    // Fallback para localStorage
    fallbackSaveToLocalStorage(storeName, data);
  }
};

// Função para carregar dados do IndexedDB
const loadData = async <T>(storeName: string, defaultValue: T[]): Promise<T[]> => {
  try {
    const db = await initDatabase();
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        if (request.result.length > 0) {
          resolve(request.result);
        } else {
          // Limpa o localStorage quando não há dados no IndexedDB
          localStorage.removeItem(storeName);
          resolve(defaultValue);
        }
      };
      request.onerror = (event) => {
        console.error(`Erro ao carregar dados (${storeName}):`, event);
        reject(event);
      };
    });
  } catch (error) {
    console.error(`Erro ao carregar dados (${storeName}):`, error);
    
    // Limpa o localStorage em caso de erro
    localStorage.removeItem(storeName);
    return defaultValue;
  }
};

// Fallback para localStorage caso o IndexedDB falhe
const fallbackSaveToLocalStorage = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Erro no fallback para localStorage (${key}):`, error);
  }
};

const fallbackLoadFromLocalStorage = <T>(key: string, defaultValue: T[]): T[] => {
  try {
    const storedData = localStorage.getItem(key);
    return storedData ? JSON.parse(storedData) : defaultValue;
  } catch (error) {
    console.error(`Erro no fallback para localStorage (${key}):`, error);
    return defaultValue;
  }
};

// Funções específicas para cada tipo de dado - mantém a mesma assinatura da API
export const savePedidos = async (pedidos: Pedido[]): Promise<void> => {
  await saveData<Pedido>(STORES.PEDIDOS, pedidos);
};

export const loadPedidos = async (): Promise<Pedido[]> => {
  return await loadData<Pedido>(STORES.PEDIDOS, []);
};

export const saveTransacoes = async (transacoes: Transacao[]): Promise<void> => {
  await saveData<Transacao>(STORES.TRANSACOES, transacoes);
};

export const loadTransacoes = async (): Promise<Transacao[]> => {
  return await loadData<Transacao>(STORES.TRANSACOES, []);
};

export const saveContatos = async (contatos: Contato[]): Promise<void> => {
  await saveData<Contato>(STORES.CONTATOS, contatos);
};

export const loadContatos = async (): Promise<Contato[]> => {
  return await loadData<Contato>(STORES.CONTATOS, []);
};

// Inicializa a versão do app se não existir
export const initializeAppVersion = async (): Promise<void> => {
  try {
    const db = await initDatabase();
    const tx = db.transaction(STORES.APP_VERSION, "readwrite");
    const store = tx.objectStore(STORES.APP_VERSION);
    
    // Verificar se a versão já existe
    const getRequest = store.get("version");
    
    getRequest.onsuccess = () => {
      if (!getRequest.result) {
        // Se não existir, apenas adiciona a versão
        store.add({ id: "version", value: CURRENT_APP_VERSION });
      }
    };
  } catch (error) {
    console.error("Erro ao inicializar versão do app:", error);
    
    // Fallback para localStorage
    try {
      const storedVersion = localStorage.getItem(STORES.APP_VERSION);
      if (!storedVersion) {
        localStorage.setItem(STORES.APP_VERSION, CURRENT_APP_VERSION);
      }
    } catch (e) {
      console.error("Erro no fallback para localStorage:", e);
    }
  }
};

// Funções de compatibilidade para manter a API síncrona (para compatibilidade com o código existente)
const syncLoadPedidos = (): Pedido[] => {
  const storedData = localStorage.getItem(STORES.PEDIDOS);
  return storedData ? JSON.parse(storedData) : [];
};

const syncLoadTransacoes = (): Transacao[] => {
  const storedData = localStorage.getItem(STORES.TRANSACOES);
  return storedData ? JSON.parse(storedData) : [];
};

const syncLoadContatos = (): Contato[] => {
  const storedData = localStorage.getItem(STORES.CONTATOS);
  return storedData ? JSON.parse(storedData) : [];
};

// Função para limpar todos os dados
export const clearAllData = async (): Promise<void> => {
  try {
    const db = await initDatabase();
    
    // Limpar cada store
    for (const storeName of Object.values(STORES)) {
      const tx = db.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);
      store.clear();
    }
    
    // Limpar localStorage
    for (const storeName of Object.values(STORES)) {
      localStorage.removeItem(storeName);
    }
  } catch (error) {
    console.error("Erro ao limpar dados:", error);
  }
};

// Exporta um objeto com todas as funções para facilitar importação
const StorageService = {
  // Funções assíncronas
  savePedidos,
  loadPedidos,
  saveTransacoes,
  loadTransacoes,
  saveContatos,
  loadContatos,
  initializeAppVersion,
  clearAllData,
  
  // Funções síncronas para compatibilidade
  syncLoadPedidos,
  syncLoadTransacoes,
  syncLoadContatos,
};

export default StorageService;

