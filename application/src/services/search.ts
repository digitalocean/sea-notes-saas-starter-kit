interface SearchFilters {
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  contentType?: 'text' | 'image' | 'all';
  sortBy?: 'relevance' | 'date' | 'title';
  sortOrder?: 'asc' | 'desc';
}

interface SearchResult<T> {
  item: T;
  score: number;
  matches: string[];
}

class SearchService {
  // Simple fuzzy search implementation
  private calculateScore(query: string, text: string): number {
    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();
    
    // Exact match gets highest score
    if (textLower.includes(queryLower)) {
      return 1.0;
    }
    
    // Calculate character similarity
    let matches = 0;
    let queryIndex = 0;
    
    for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
      if (textLower[i] === queryLower[queryIndex]) {
        matches++;
        queryIndex++;
      }
    }
    
    return matches / queryLower.length;
  }

  search<T extends { title: string; content: string; createdAt: Date }>(
    items: T[],
    query: string,
    filters?: SearchFilters
  ): SearchResult<T>[] {
    let filteredItems = items;

    // Apply filters
    if (filters?.dateRange) {
      filteredItems = filteredItems.filter(item => 
        item.createdAt >= filters.dateRange!.start && 
        item.createdAt <= filters.dateRange!.end
      );
    }

    // Search and score
    const results: SearchResult<T>[] = [];
    
    for (const item of filteredItems) {
      const titleScore = this.calculateScore(query, item.title);
      const contentScore = this.calculateScore(query, item.content);
      const maxScore = Math.max(titleScore, contentScore);
      
      if (maxScore > 0.3) { // Minimum relevance threshold
        const matches: string[] = [];
        if (titleScore > 0.3) matches.push('title');
        if (contentScore > 0.3) matches.push('content');
        
        results.push({
          item,
          score: maxScore,
          matches,
        });
      }
    }

    // Sort by score (relevance) by default
    results.sort((a, b) => {
      if (filters?.sortBy === 'date') {
        const order = filters.sortOrder === 'asc' ? 1 : -1;
        return (a.item.createdAt.getTime() - b.item.createdAt.getTime()) * order;
      }
      if (filters?.sortBy === 'title') {
        const order = filters.sortOrder === 'asc' ? 1 : -1;
        return a.item.title.localeCompare(b.item.title) * order;
      }
      return b.score - a.score; // Default: relevance
    });

    return results;
  }

  highlightMatches(text: string, query: string): string {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }
}

export const searchService = new SearchService();
export type { SearchFilters, SearchResult };
