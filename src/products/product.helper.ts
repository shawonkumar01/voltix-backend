export class ProductHelper {
  static parseTags(tagsString: string): string[] {
    if (!tagsString) return [];
    return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  }

  static formatTags(tagsArray: string[]): string {
    if (!tagsArray || tagsArray.length === 0) return '';
    return tagsArray.join(', ');
  }

  static parseKeywords(keywordsString: string): string[] {
    if (!keywordsString) return [];
    return keywordsString.split(',').map(keyword => keyword.trim()).filter(keyword => keyword.length > 0);
  }

  static formatKeywords(keywordsArray: string[]): string {
    if (!keywordsArray || keywordsArray.length === 0) return '';
    return keywordsArray.join(', ');
  }

  static parseImages(imagesString: string): string[] {
    if (!imagesString) return [];
    return imagesString.split(',').map(img => img.trim()).filter(img => img.length > 0);
  }

  static formatImages(imagesArray: string[]): string {
    if (!imagesArray || imagesArray.length === 0) return '';
    return imagesArray.join(',');
  }
}
