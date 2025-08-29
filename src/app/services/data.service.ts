
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Network } from '@capacitor/network';
import { StorageService } from '@services/storage.service';

export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'https://jsonplaceholder.typicode.com/posts';
  private storageService = inject(StorageService);

  constructor(private http: HttpClient) { }

  /**
   * Get posts with pagination (5 posts per page) with offline support
   * @param page Page number (starts from 1)
   * @param forceRefresh Force refresh from API, bypassing cache
   */
  public getPosts(page: number = 1, forceRefresh: boolean = false): Observable<Post[]> {
    if (!forceRefresh) {
      // Try to get cached posts first
      return from(this.getCachedPostsFirst(page));
    } else {
      // Force refresh from API
      return this.getPostsFromAPI(page);
    }
  }

  private async getCachedPostsFirst(page: number): Promise<Post[]> {
    try {
      // Check if we have cached posts
      const cachedPosts = await this.storageService.getCachedPosts(page);
      
      if (cachedPosts) {
        console.log(`Returning cached posts for page ${page}`);
        return cachedPosts;
      } else {
        // No cache, fetch from API
        return await this.fetchAndCachePosts(page);
      }
    } catch (error) {
      console.error('Error getting cached posts:', error);
      // Fallback to API
      return await this.fetchAndCachePosts(page);
    }
  }

  private async fetchAndCachePosts(page: number): Promise<Post[]> {
    try {
      const start = (page - 1) * 5;
      const posts = await this.http.get<Post[]>(`${this.apiUrl}?_start=${start}&_limit=5`).toPromise();
      
      if (posts) {
        // Cache the posts
        await this.storageService.cachePosts(page, posts);
        console.log(`Cached posts for page ${page}`);
        return posts;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching posts from API:', error);
      // Try to return any cached posts as fallback
      const cachedPosts = await this.storageService.getCachedPosts(page);
      return cachedPosts || [];
    }
  }

  private getPostsFromAPI(page: number): Observable<Post[]> {
    const start = (page - 1) * 5;
    return this.http.get<Post[]>(`${this.apiUrl}?_start=${start}&_limit=5`).pipe(
      tap(async (posts) => {
        // Cache the fresh posts
        await this.storageService.cachePosts(page, posts);
        console.log(`Fresh posts cached for page ${page}`);
      }),
      catchError((error) => {
        console.error('API error, trying cached posts:', error);
        // Fallback to cached posts
        return from(this.storageService.getCachedPosts(page).then(posts => posts || []));
      })
    );
  }

  /**
   * Get a single post by id
   */
  public getPostById(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/${id}`);
  }

  /**
   * Check network connectivity
   */
  public async isOnline(): Promise<boolean> {
    const status = await Network.getStatus();
    return status.connected;
  }

  /**
   * Clear all cached posts
   */
  public async clearCache(): Promise<void> {
    await this.storageService.clearPostsCache();
  }

  /**
   * Get cache information
   */
  public async getCacheInfo(): Promise<{ totalPages: number, lastCached: string | null }> {
    return await this.storageService.getCacheInfo();
  }
}
