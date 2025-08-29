import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
  }

  // Generic storage methods
  public async set(key: string, value: any): Promise<any> {
    return this._storage?.set(key, value);
  }

  public async get(key: string): Promise<any> {
    return this._storage?.get(key);
  }

  public async remove(key: string): Promise<any> {
    return this._storage?.remove(key);
  }

  public async clear(): Promise<void> {
    return this._storage?.clear();
  }

  public async keys(): Promise<string[]> {
    return this._storage?.keys() || [];
  }

  // Posts-specific methods
  public async cachePosts(page: number, posts: any[]): Promise<void> {
    const key = `posts_page_${page}`;
    const cacheData = {
      posts,
      timestamp: new Date().getTime(),
      page
    };
    await this.set(key, cacheData);
  }

  public async getCachedPosts(page: number): Promise<any[] | null> {
    const key = `posts_page_${page}`;
    const cacheData = await this.get(key);
    
    if (cacheData) {
      // Check if cache is still valid (24 hours)
      const now = new Date().getTime();
      const cacheAge = now - cacheData.timestamp;
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (cacheAge < maxAge) {
        return cacheData.posts;
      } else {
        // Cache expired, remove it
        await this.remove(key);
      }
    }
    
    return null;
  }

  public async clearPostsCache(): Promise<void> {
    const keys = await this.keys();
    const postsKeys = keys.filter(key => key.startsWith('posts_page_'));
    
    for (const key of postsKeys) {
      await this.remove(key);
    }
  }

  public async getCacheInfo(): Promise<{ totalPages: number, lastCached: string | null }> {
    const keys = await this.keys();
    const postsKeys = keys.filter(key => key.startsWith('posts_page_'));
    
    let lastCached: string | null = null;
    let latestTimestamp = 0;
    
    for (const key of postsKeys) {
      const cacheData = await this.get(key);
      if (cacheData && cacheData.timestamp > latestTimestamp) {
        latestTimestamp = cacheData.timestamp;
        lastCached = new Date(cacheData.timestamp).toLocaleString();
      }
    }
    
    return {
      totalPages: postsKeys.length,
      lastCached
    };
  }
}
